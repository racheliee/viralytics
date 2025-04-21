import os
import json
import sys
import time
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image, UnidentifiedImageError
from transformers import (
    BlipProcessor,
    BlipForConditionalGeneration,
    CLIPModel,
    CLIPProcessor,
)
from tqdm import tqdm

# ===== 설정 =====
class Config:
    # 파일 경로
    INPUT_JSON_PATH = "merged_dataset_post_with_images.json"
    OUTPUT_JSON_PATH = None  # 자동 생성됨
    
    # 실행 모드
    RUN_IN_BACKGROUND = False  # 백그라운드 실행 여부
    USE_SCORING = True         # CLIP 기반 캡션 스코어링 여부
    BATCH_PROCESSING = True    # 배치 처리 사용 여부
    
    # 이미지 처리 설정
    MAX_IMAGES_PER_POST = 3    # 포스트당 처리할 최대 이미지 수 (0=전체)
    SKIP_EXISTING = True       # 이미 캡션이 있는 항목 건너뛰기
    
    # 캡션 생성 설정
    MAX_CAPTION_LENGTH = 15    # 최대 캡션 길이
    NUM_CAPTIONS = 3           # CLIP 스코어링 시 생성할 후보 캡션 수
    
    # 배치 처리 설정
    BATCH_SIZE = 4             # GPU 메모리에 따라 조정
    NUM_WORKERS = 2            # 데이터 로딩 워커 수
    
    # 기술적 설정
    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
    
    def __init__(self):
        # 출력 파일명 자동 생성
        input_base = Path(self.INPUT_JSON_PATH).stem
        self.OUTPUT_JSON_PATH = f"{input_base}_with_captions.json"


# ===== 데이터셋 및 로더 =====
class ImageCaptioningDataset(Dataset):
    def __init__(self, image_paths: List[str], transform=None):
        self.image_paths = image_paths
        self.transform = transform
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, idx):
        image_path = self.image_paths[idx]
        try:
            image = Image.open(image_path).convert("RGB")
            if self.transform:
                image = self.transform(image)
            return image, image_path
        except (UnidentifiedImageError, FileNotFoundError, OSError) as e:
            # 손상되거나 찾을 수 없는 이미지 처리
            print(f"이미지 로딩 에러 ({image_path}): {e}")
            # 더미 이미지 반환 (1x1 검은색)
            dummy = Image.new("RGB", (224, 224), (0, 0, 0))
            if self.transform:
                dummy = self.transform(dummy)
            return dummy, image_path


# ===== 캡션 생성 클래스 =====
class CaptionGenerator:
    def __init__(self, config: Config):
        self.config = config
        self.invalid_patterns = [
            "man in a man", 
            "woman in a woman", 
            "holding a holding",
            "person wearing a person",
            "a image of a",
            "a picture of a picture"
        ]
        
        print(f"디바이스: {self.config.DEVICE}")
        print("BLIP 모델 로딩 중...")
        self.blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        self.blip_model = BlipForConditionalGeneration.from_pretrained(
            "Salesforce/blip-image-captioning-base"
        ).to(self.config.DEVICE)
        
        if self.config.USE_SCORING:
            print("CLIP 스코어링 모델 로딩 중...")
            self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.config.DEVICE)
    
    def filter_incorrect_caption(self, caption: str) -> bool:
        """부적절한 패턴이 포함된 캡션 필터링"""
        return not any(pattern in caption.lower() for pattern in self.invalid_patterns)
    
    def score_caption(self, image, caption: str) -> float:
        """CLIP을 사용하여 이미지-캡션 일치도 점수 계산"""
        inputs = self.clip_processor(
            text=[caption], 
            images=image, 
            return_tensors="pt", 
            padding=True
        ).to(self.config.DEVICE)
        
        with torch.no_grad():
            outputs = self.clip_model(**inputs)
        return outputs.logits_per_image.item()
    
    def generate_caption_for_image(self, image) -> str:
        """단일 이미지에 대한 캡션 생성"""
        try:
            inputs = self.blip_processor(image, return_tensors="pt").to(self.config.DEVICE)

            if self.config.USE_SCORING:
                # 후보 캡션 여러 개 생성
                with torch.no_grad():
                    outputs = self.blip_model.generate(
                        **inputs,
                        max_length=30,
                        num_beams=5,
                        num_return_sequences=self.config.NUM_CAPTIONS,
                        no_repeat_ngram_size=2,
                        temperature=0.7,
                    )
                
                captions = [
                    self.blip_processor.decode(o, skip_special_tokens=True) 
                    for o in outputs
                ]
                
                # 유효한 캡션만 필터링
                valid_captions = [cap for cap in captions if self.filter_incorrect_caption(cap)]
                if not valid_captions:
                    return "image"
                
                # CLIP 점수 계산 및 최고 점수 캡션 선택
                scored = [(cap, self.score_caption(image, cap)) for cap in valid_captions]
                best_caption = max(scored, key=lambda x: x[1])[0]
                return best_caption
            else:
                # 단일 캡션 생성
                with torch.no_grad():
                    output = self.blip_model.generate(
                        **inputs,
                        max_length=self.config.MAX_CAPTION_LENGTH,
                        num_beams=4,
                        early_stopping=True,
                        temperature=0.6,
                        repetition_penalty=1.2,
                    )
                
                caption = self.blip_processor.decode(output[0], skip_special_tokens=True)
                return caption if self.filter_incorrect_caption(caption) else "image"
        
        except Exception as e:
            print(f"캡션 생성 오류: {e}")
            return "image"
    
    def generate_captions_batch(self, image_batch, paths_batch) -> Dict[str, str]:
        """배치로 여러 이미지의 캡션 생성"""
        results = {}
        
        try:
            # 배치 처리
            inputs = self.blip_processor(image_batch, return_tensors="pt", padding=True).to(self.config.DEVICE)
            
            with torch.no_grad():
                if self.config.USE_SCORING:
                    # 각 이미지마다 여러 캡션 생성
                    outputs = []
                    for i in range(len(image_batch)):
                        image_inputs = {k: v[i:i+1] for k, v in inputs.items()}
                        output = self.blip_model.generate(
                            **image_inputs,
                            max_length=30,
                            num_beams=5,
                            num_return_sequences=self.config.NUM_CAPTIONS,
                            no_repeat_ngram_size=2,
                            temperature=0.7,
                        )
                        outputs.append(output)
                    
                    # 각 이미지별로 최적의 캡션 선택
                    for i, (image, path) in enumerate(zip(image_batch, paths_batch)):
                        captions = [
                            self.blip_processor.decode(o, skip_special_tokens=True) 
                            for o in outputs[i]
                        ]
                        valid_captions = [cap for cap in captions if self.filter_incorrect_caption(cap)]
                        
                        if not valid_captions:
                            results[path] = "image"
                            continue
                        
                        scored = [(cap, self.score_caption(image, cap)) for cap in valid_captions]
                        best_caption = max(scored, key=lambda x: x[1])[0]
                        results[path] = best_caption
                else:
                    # 일괄 생성
                    outputs = self.blip_model.generate(
                        **inputs,
                        max_length=self.config.MAX_CAPTION_LENGTH,
                        num_beams=4,
                        early_stopping=True,
                        temperature=0.6,
                        repetition_penalty=1.2,
                    )
                    
                    captions = [
                        self.blip_processor.decode(output, skip_special_tokens=True) 
                        for output in outputs
                    ]
                    
                    for path, caption in zip(paths_batch, captions):
                        results[path] = caption if self.filter_incorrect_caption(caption) else "image"
        
        except Exception as e:
            print(f"배치 처리 오류: {e}")
            # 오류 시 개별 처리로 폴백
            for image, path in zip(image_batch, paths_batch):
                try:
                    results[path] = self.generate_caption_for_image(image)
                except:
                    results[path] = "image"
        
        return results


# ===== JSON 처리 클래스 =====
class JsonProcessor:
    def __init__(self, config: Config, caption_generator: CaptionGenerator):
        self.config = config
        self.caption_generator = caption_generator
    
    def collect_images_to_process(self, data: List[Dict]) -> List[Tuple[int, int, str]]:
        """처리할 이미지 목록 수집: (항목 인덱스, 이미지 인덱스, 이미지 경로)"""
        image_tasks = []
        
        for item_idx, item in enumerate(data):
            if item.get("type") != "post":
                continue
                
            images = item.get("images", [])
            if not images:
                continue
            
            # 이미 캡션이 있고 스킵 옵션이 켜져 있으면 건너뛰기
            if self.config.SKIP_EXISTING and item.get("image_captions"):
                continue
            
            # 포스트당 처리할 이미지 수 제한
            num_to_process = len(images)
            if self.config.MAX_IMAGES_PER_POST > 0:
                num_to_process = min(num_to_process, self.config.MAX_IMAGES_PER_POST)
            
            for img_idx in range(num_to_process):
                if img_idx < len(images):  # 인덱스 범위 확인
                    image_path = images[img_idx]
                    if os.path.exists(image_path):
                        image_tasks.append((item_idx, img_idx, image_path))
        
        return image_tasks
    
    def process_json(self) -> None:
        """JSON 파일 처리의 메인 함수"""
        start_time = time.time()
        
        print(f"JSON 파일 로딩 중: {self.config.INPUT_JSON_PATH}")
        try:
            with open(self.config.INPUT_JSON_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except FileNotFoundError:
            print(f"[에러] 파일을 찾을 수 없습니다: {self.config.INPUT_JSON_PATH}")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"[에러] JSON 파싱 실패: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"[에러] 파일 로딩 중 알 수 없는 문제가 발생했습니다: {e}")
            sys.exit(1)

        
        # 처리할 이미지 목록 수집
        image_tasks = self.collect_images_to_process(data)
        print(f"처리할 이미지: {len(image_tasks)}개")
        
        # 결과를 저장할 매핑 초기화
        results = {}  # {(item_idx, img_idx): caption}
        
        if self.config.BATCH_PROCESSING and len(image_tasks) > 1:
            # 배치 처리 설정
            paths = [task[2] for task in image_tasks]
            dataset = ImageCaptioningDataset(paths)
            dataloader = DataLoader(
                dataset, 
                batch_size=self.config.BATCH_SIZE,
                num_workers=self.config.NUM_WORKERS,
                shuffle=False,
                collate_fn=custom_collate_fn
            )
            
            # 배치 처리 실행
            print(f"배치 처리 시작 (배치 크기: {self.config.BATCH_SIZE})")
            batch_idx = 0
            for batch in tqdm(dataloader, desc="이미지 캡션 생성"):
                images, image_paths = batch
                images = [img for img in images]  # 텐서를 PIL 이미지로 변환하지 않음
                
                # 현재 배치의 원본 인덱스 찾기
                path_to_indices = {task[2]: (task[0], task[1]) for task in image_tasks}
                
                # 배치로 캡션 생성
                batch_results = self.caption_generator.generate_captions_batch(images, image_paths)
                
                # 결과 매핑
                for path, caption in batch_results.items():
                    if path in path_to_indices:
                        item_idx, img_idx = path_to_indices[path]
                        results[(item_idx, img_idx)] = caption
                
                batch_idx += 1
                
                # 배치 처리 실행
                print(f"배치 처리 시작 (배치 크기: {self.config.BATCH_SIZE})")
                batch_idx = 0

                for batch in tqdm(dataloader, desc="이미지 캡션 생성", disable=self.config.RUN_IN_BACKGROUND):
                    images, image_paths = batch
                    images = [img for img in images]
                    
                    path_to_indices = {task[2]: (task[0], task[1]) for task in image_tasks}
                    
                    batch_results = self.caption_generator.generate_captions_batch(images, image_paths)
                    
                    for path, caption in batch_results.items():
                        if path in path_to_indices:
                            item_idx, img_idx = path_to_indices[path]
                            results[(item_idx, img_idx)] = caption

                    batch_idx += 1
                    
                    # 백그라운드 모드에서만 로그 출력
                    if self.config.RUN_IN_BACKGROUND and batch_idx % 5 == 0:
                        print(f"진행 상황: {batch_idx * self.config.BATCH_SIZE}/{len(image_tasks)}")

        else:
            # 단일 이미지 처리
            print("단일 이미지 처리 시작")
            for i, (item_idx, img_idx, path) in enumerate(tqdm(image_tasks, desc="이미지 캡션 생성")):
                try:
                    image = Image.open(path).convert("RGB")
                    caption = self.caption_generator.generate_caption_for_image(image)
                    results[(item_idx, img_idx)] = caption
                    
                    if i % 10 == 0 and i > 0:
                        print(f"진행 상황: {i}/{len(image_tasks)}")
                except Exception as e:
                    print(f"이미지 처리 실패 ({path}): {e}")
                    results[(item_idx, img_idx)] = "image"
        
        # 결과를 JSON 데이터에 적용
        for item_idx, item in enumerate(data):
            if item.get("type") != "post":
                continue
                
            # 이 항목의 캡션 수집
            item_captions = []
            for img_idx in range(len(item.get("images", []))):
                if (item_idx, img_idx) in results:
                    item_captions.append(results[(item_idx, img_idx)])
            
            # 캡션이 있으면 저장
            if item_captions:
                item["image_captions"] = item_captions
        
        # 결과 저장
        print(f"결과 저장 중: {self.config.OUTPUT_JSON_PATH}")
        with open(self.config.OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        elapsed_time = time.time() - start_time
        print(f"처리 완료! 소요 시간: {elapsed_time:.2f}초")
        print(f"생성된 캡션: {len(results)}개")


# ===== 백그라운드 실행 함수 =====
def run_background():
    script_path = os.path.abspath(__file__)
    log_path = "caption_log.txt"
    cmd = f"nohup python3 {script_path} > {log_path} 2>&1 &"
    os.system(cmd)
    print(f"[Background] 백그라운드에서 실행 중. 로그: {log_path}")

# ===== 커스텀 데이터 로더 함수 =====
def custom_collate_fn(batch):
    images, paths = zip(*batch)  # 리스트의 튜플들을 풀어냄
    return list(images), list(paths)


# ===== 메인 실행 =====
def main():
    # 설정 초기화
    config = Config()
    
    # 백그라운드 실행 체크
    if config.RUN_IN_BACKGROUND:
        run_background()
        sys.exit(0)
    
    # 캡션 생성기 초기화
    caption_generator = CaptionGenerator(config)
    
    # JSON 처리기 실행
    processor = JsonProcessor(config, caption_generator)
    processor.process_json()


if __name__ == "__main__":
    main()
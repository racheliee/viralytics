import json
import os
import time
import hashlib
import asyncio
import aiohttp
import aiofiles
import sys
from functools import partial
from pathlib import Path
import shutil

# === 설정 ===
MODE = "post"  # 'all', 'post', 'reel'
DOWNLOAD_IMAGES = True
IMAGES_PER_POST = 1  # 각 포스트마다 다운로드할 이미지 수 (0 = 모두 다운로드)
MAX_CONCURRENT_REQUESTS = 50  # 동시 네트워크 요청 수
RETRY_COUNT = 3  # 실패 시 재시도 횟수
TIMEOUT = 5  # 요청 타임아웃 (초)
CACHE_IMAGES = True  # 이미지 URL 기반 캐싱 사용
STATIC_IMAGE_DIR = "static/images"
CACHE_DIR = "static/cache"

# === 디렉토리 생성 ===
os.makedirs(STATIC_IMAGE_DIR, exist_ok=True)
if CACHE_IMAGES:
    os.makedirs(CACHE_DIR, exist_ok=True)

# === 파일 로딩 함수
def load_json_file(path: str, name: str):
    print(f"[INFO] {name} 파일 로딩 중: {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[에러] {name} 파일을 찾을 수 없습니다: {path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"[에러] {name} JSON 파싱 실패: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"[에러] {name} 파일 로딩 중 알 수 없는 오류 발생: {e}")
        sys.exit(1)

# === 파일 로딩 ===
posts = load_json_file("post.json", "Post")
reels = load_json_file("reels.json", "Reels")
profiles = load_json_file("profile.json", "Profile")

# === 프로필 딕셔너리화 ===
profile_dict = {p["id"]: p for p in profiles}


# === 지연 측정 및 진행 상황 표시 ===
class DownloadStats:
    def __init__(self, total_images):
        self.total = total_images
        self.completed = 0
        self.failed = 0
        self.cached = 0
        self.start_time = time.time()
        self.last_update = time.time()
        self.update_interval = 1.0  # 초 단위 업데이트 간격
    
    def update(self, success=False, cached=False, failed=False):
        self.completed += 1 if success or cached else 0
        self.failed += 1 if failed else 0
        self.cached += 1 if cached else 0
        
        current_time = time.time()
        if current_time - self.last_update > self.update_interval:
            self.last_update = current_time
            self._print_progress()
    
    def _print_progress(self):
        elapsed = time.time() - self.start_time
        if self.completed == 0:
            rate = 0
        else:
            rate = self.completed / elapsed
        
        percent_done = (self.completed + self.failed) / self.total * 100
        
        print(f"\r진행: {self.completed+self.failed}/{self.total} ({percent_done:.1f}%) " +
              f"완료: {self.completed} 실패: {self.failed} 캐시: {self.cached} " +
              f"속도: {rate:.1f}개/초", end="")
    
    def finalize(self):
        elapsed = time.time() - self.start_time
        print(f"\n총 {self.total}개 이미지 처리 완료")
        print(f"성공: {self.completed}개, 실패: {self.failed}개, 캐시 사용: {self.cached}개")
        print(f"총 소요 시간: {elapsed:.2f}초, 평균 속도: {self.total/elapsed:.1f}개/초")


# === 비동기 이미지 다운로드 ===
async def download_images_async(posts):
    # 다운로드 작업 목록 생성
    download_tasks = []
    url_cache = {}  # URL 중복 방지를 위한 캐시
    url_to_file_map = {}  # URL -> 파일 경로 매핑
    
    for post_idx, post in enumerate(posts):
        images = post.get("images", [])
        if not images:
            continue
            
        # 다운로드할 이미지 수 결정
        num_to_download = len(images) if IMAGES_PER_POST == 0 else min(IMAGES_PER_POST, len(images))
        
        for img_idx in range(num_to_download):
            if img_idx >= len(images):
                break
                
            url = images[img_idx]
            if url not in url_cache:
                url_cache[url] = True
                filename = f"post_{post_idx}_{img_idx}.jpg"
                filepath = os.path.join(STATIC_IMAGE_DIR, filename)
                url_to_file_map[(post_idx, img_idx)] = filepath
                download_tasks.append((post_idx, img_idx, url, filepath))
            else:
                # 이미 다운로드 목록에 있는 URL이므로 중복 방지
                for task_post_idx, task_img_idx, task_url, task_filepath in download_tasks:
                    if task_url == url:
                        url_to_file_map[(post_idx, img_idx)] = task_filepath
                        break

    print(f"총 {len(download_tasks)}개 이미지 다운로드 준비 완료")
    
    # 결과 저장을 위한 사전
    results = {i: [] for i in range(len(posts))}
    stats = DownloadStats(len(download_tasks))
    
    # 세마포어를 사용하여 동시 요청 수 제한
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    
    async def download_single_image(post_idx, img_idx, url, filepath):
        # 캐싱을 위한 파일명 생성
        url_hash = None
        cache_path = None
        
        if CACHE_IMAGES:
            url_hash = hashlib.md5(url.encode()).hexdigest()
            cache_path = os.path.join(CACHE_DIR, f"{url_hash}.jpg")
            
            # 캐시에 있으면 바로 사용
            if os.path.exists(cache_path):
                # 캐시에서 복사
                shutil.copy2(cache_path, filepath)
                stats.update(cached=True)
                return True
        
        # 세마포어를 사용하여 동시 요청 수 제한
        async with semaphore:
            # 재시도 로직
            for attempt in range(RETRY_COUNT):
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(url, timeout=aiohttp.ClientTimeout(total=TIMEOUT)) as response:
                            if response.status == 200:
                                # 데이터 읽기
                                data = await response.read()
                                
                                # 파일에 쓰기
                                async with aiofiles.open(filepath, 'wb') as f:
                                    await f.write(data)
                                
                                # 캐시에 저장
                                if CACHE_IMAGES and cache_path:
                                    async with aiofiles.open(cache_path, 'wb') as f:
                                        await f.write(data)
                                
                                stats.update(success=True)
                                return True
                            else:
                                if attempt == RETRY_COUNT - 1:
                                    print(f"\n이미지 다운로드 실패 (HTTP {response.status}): 포스트 {post_idx}, 이미지 {img_idx} - {url}")
                except asyncio.TimeoutError:
                    if attempt == RETRY_COUNT - 1:
                        print(f"\n타임아웃: 포스트 {post_idx}, 이미지 {img_idx} - {url}")
                except Exception as e:
                    if attempt == RETRY_COUNT - 1:
                        print(f"\n예외 발생: 포스트 {post_idx}, 이미지 {img_idx} - {type(e).__name__}: {e}")
                
                # 재시도 전 대기
                if attempt < RETRY_COUNT - 1:
                    await asyncio.sleep(0.5)
        
        stats.update(failed=True)
        return False
    
    # 모든 다운로드 작업 동시 실행
    start_time = time.time()
    download_coroutines = [download_single_image(*task) for task in download_tasks]
    results_list = await asyncio.gather(*download_coroutines, return_exceptions=False)
    
    # 결과 구성
    for i, task in enumerate(download_tasks):
        post_idx, img_idx, _, filepath = task
        if results_list[i]:  # 다운로드 성공
            results[post_idx].append((img_idx, filepath))
    
    # URL 중복 처리를 위한 매핑 추가
    for (post_idx, img_idx), filepath in url_to_file_map.items():
        if os.path.exists(filepath) and (post_idx, img_idx) not in [(t[0], t[1]) for t in download_tasks]:
            results[post_idx].append((img_idx, filepath))
    
    # 각 포스트별로 이미지 경로 정렬
    for post_idx in results:
        results[post_idx] = [
            path for _, path in sorted(results[post_idx], key=lambda x: x[0])
        ]
    
    stats.finalize()
    return results


# === 객체 생성 함수 ===
def build_object_base(data_type, data, profile, mode, images=None):
    base = {
        "type": data_type,
        "caption": data.get("caption"),
        "hashtags": data.get("hashtags", []),
        "mentions": data.get("mentions", []),
        "commentsCount": data.get("commentsCount", 0),
        "likesCount": data.get("likesCount", 0),
        "timestamp": data.get("timestamp"),
        "owner": profile or {},
    }

    if mode == "all":
        base.update(
            {
                "isSponsored": data.get("isSponsored") if data_type == "post" else None,
                "videoViewCount": (
                    data.get("videoViewCount") if data_type == "reel" else None
                ),
                "videoPlayCount": (
                    data.get("videoPlayCount") if data_type == "reel" else None
                ),
                "videoDuration": (
                    data.get("videoDuration") if data_type == "reel" else None
                ),
                "audio_id": (
                    data.get("musicInfo", {}).get("audio_id")
                    if data_type == "reel"
                    else None
                ),
            }
        )

    elif mode == "post":
        base.update({"isSponsored": data.get("isSponsored")})

    elif mode == "reel":
        base.update(
            {
                "videoViewCount": data.get("videoViewCount"),
                "videoPlayCount": data.get("videoPlayCount"),
                "videoDuration": data.get("videoDuration"),
                "audio_id": data.get("musicInfo", {}).get("audio_id"),
            }
        )
    
    # 이미지 필드는 선택적으로 추가
    if DOWNLOAD_IMAGES and images is not None:
        base["images"] = images
    elif mode in ["all", "post"] and data_type == "post":
        # 다운로드하지 않더라도 원본 URL을 유지하는 옵션
        base["imageUrls"] = data.get("images", [])

    return base


# === 메인 프로세스 함수 ===
async def process():
    print("데이터 병합 프로세스 시작...")
    start_time = time.time()

    merged_data = []
    
    # 1. 이미지 다운로드 (비동기)
    image_map = {}
    if MODE in ["all", "post"] and DOWNLOAD_IMAGES:
        image_map = await download_images_async(posts)
    
    # 2. POST 처리
    if MODE in ["all", "post"]:
        for idx, post in enumerate(posts):
            profile = profile_dict.get(post["ownerId"], {})
            downloaded_images = image_map.get(idx, []) if DOWNLOAD_IMAGES else None
            if DOWNLOAD_IMAGES and not downloaded_images:
                continue
            if not DOWNLOAD_IMAGES and not post.get("images"):
                continue

            obj = build_object_base("post", post, profile, MODE, downloaded_images)
            merged_data.append(obj)
    
    # 3. REELS 처리
    if MODE in ["all", "reel"]:
        for reel in reels:
            profile = profile_dict.get(reel["ownerId"], {})
            obj = build_object_base("reel", reel, profile, MODE)
            merged_data.append(obj)
    
    # 4. 저장
    output_filename = f"merged_dataset_{MODE}"
    if DOWNLOAD_IMAGES:
        output_filename += "_with_images"
    output_filename += ".json"
    
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)
    
    total_time = time.time() - start_time
    print(f"'{MODE}' 모드로 병합 완료. 총 {len(merged_data)}개 항목 처리")
    print(f"이미지 다운로드: {DOWNLOAD_IMAGES}, 항목당 이미지 수: {IMAGES_PER_POST if IMAGES_PER_POST > 0 else '모두'}")
    print(f"결과 파일: {output_filename}")
    print(f"총 소요 시간: {total_time:.2f}초")


# === 비동기 메인 함수 실행 ===
if __name__ == "__main__":
    asyncio.run(process())
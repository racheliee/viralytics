# Instgram Data Refine

## Introduction


**refine.py**:  
  
- JSON 데이터(게시물, 릴, 프로필)를 불러오고, 이미지 다운로드(비동기, 캐싱, 동시 요청 제한) 후 데이터를 병합하여 최종 JSON 파일로 저장

**image_caption.py**:  
  
- refine.py에서 생성된 JSON 파일의 이미지 field에 대해 BLIP 모델을 사용한 캡션 생성을 수행  
- 필요에 따라 CLIP 모델 기반 캡션 스코어링과 batch 처리를 지원하며, 생성된 캡션은 원본 JSON에 추가되어 새로운 파일로 저장

**to_csv.py**:

- refine.py 또는 image_caption.py에서 생성된 JSON 파일을 머신러닝 학습에 적합한 형태의 CSV 파일로 변환
- `post` 또는 `reel` 중 하나의 타입만 선택적으로 변환 가능
- caption의 경우 `\n`으로 분리된 여러 줄을 구분자(`|||`)로 이어붙여 하나의 필드로 저장
- 리스트 형태의 `hashtags`, `mentions`, `images` 등은 쉼표 `,`로 연결된 문자열로 저장

## Pre-requisites

```
pip install aiohttp aiofiles pillow torch transformers tqdm
```

## refine.py

### 기능 및 동작 로직

- **데이터 로딩**:  
  - `post.json`, `reels.json`, `profile.json` 파일을 읽어와서 각각의 데이터를 파싱
  - 프로필 데이터는 딕셔너리 형태(`profile_dict`)로 저장되어 이후 각 게시물과 매칭됩

- **비동기 이미지 다운로드**:  
  - 각 게시물에서 이미지를 추출하고, 각 포스트당 다운로드할 이미지 수를 결정
  - **동시 요청 제한**: `asyncio.Semaphore`를 사용해 최대 동시 요청 수(`MAX_CONCURRENT_REQUESTS`, 기본 50)를 제한
  - **재시도 및 타임아웃**: 각 요청당 설정된 타임아웃(`TIMEOUT`, 기본 5초)과 재시도 횟수(`RETRY_COUNT`, 기본 3회)를 적용하여 안정성을 높임
  - **캐싱 처리**: 설정에 따라 다운로드한 이미지를 URL 해시 기반으로 캐시에 저장, 중복 다운로드를 방지

- **데이터 병합 및 저장**:  
  - 다운로드된 이미지 파일 경로와 각 게시물의 메타 데이터(캡션, 해시태그, 언급 등, 프로필 정보 포함)를 결합
  - 최종 결과는 `merged_dataset_{MODE}_with_images.json`와 같이 모드에 따라 출력 파일로 저장

### 주요 설정 값

- **MODE**:  
  - `all`, `post`, `reel` 중 선택 (처리할 데이터 종류 결정)

- **DOWNLOAD_IMAGES**:  
  - 이미지 다운로드 여부 (True/False)

- **IMAGES_PER_POST**:  
  - 각 게시물당 다운로드할 이미지 수 (0은 모두 다운로드)

- **네트워크 관련 설정**:  
  - `MAX_CONCURRENT_REQUESTS`: 동시 네트워크 요청 최대 수 (기본 50)  
  - `RETRY_COUNT`: 재시도 횟수 (기본 3회)  
  - `TIMEOUT`: 요청 타임아웃 (초 단위, 기본 5초)

- **캐싱 옵션**:  
  - `CACHE_IMAGES`: 캐싱 사용 여부  
  - 캐시 및 이미지 저장 경로: `STATIC_IMAGE_DIR`, `CACHE_DIR`

- **진행 상황 표시**:  
  - DownloadStats 클래스를 통해 실시간 다운로드 진행률, 속도, 성공/실패/캐시 사용 내역 출력

## image_caption.py

### 기능 및 동작 로직

- **JSON 데이터 로딩 및 이미지 수집**:  
  - refine.py에서 생성된 JSON 파일(예: `merged_dataset_post_with_images.json`)을 읽어와서 각 게시물에 포함된 이미지 경로 목록을 수집
  - 설정에 따라 이미 캡션이 있는 항목은 건너뛰고, 각 게시물당 처리할 이미지 수를 제한

- **캡션 생성**:  
  - **BLIP 모델**을 활용하여 이미지에 대해 캡션을 생성
  - **CLIP 기반 스코어링(옵션)**: 후보 캡션 여러 개를 생성한 후, CLIP 모델로 이미지-캡션 일치 점수를 산출하여 가장 적절한 캡션을 선택
  - 단일 처리와 batch 처리 모두를 지원하며, batch 처리 시 실패하면 개별 처리로 fallback

- **JSON 업데이트 및 저장**:  
  - 생성된 캡션을 원본 JSON 데이터에 추가한 후, 새 JSON 파일(예: `merged_dataset_post_with_images_with_captions.json`)로 저장

### 주요 설정 값

- **경로 설정**:  
  - `INPUT_JSON_PATH`: 입력 JSON 파일 경로  
  - `OUTPUT_JSON_PATH`: 자동 생성 (입력 파일 이름을 기반으로 함)

- **실행 모드 및 처리 옵션**:  
  - `RUN_IN_BACKGROUND`: 백그라운드 실행 여부  
  - `USE_SCORING`: CLIP 모델 기반 캡션 스코어링 사용 여부  
  - `BATCH_PROCESSING`: batch 처리 사용 여부  
  - `SKIP_EXISTING`: 이미 캡션이 있는 항목 건너뛰기 여부

- **이미지 및 캡션 관련 설정**:  
  - `MAX_IMAGES_PER_POST`: 각 게시물당 처리할 최대 이미지 수  
  - `MAX_CAPTION_LENGTH`: 최대 캡션 길이  
  - `NUM_CAPTIONS`: 후보 캡션 생성 개수 (스코어링 시 사용)

- **batch 처리 관련 설정**:  
  - `BATCH_SIZE`: batch 처리 시 한 번에 로딩할 이미지 수  
  - `NUM_WORKERS`: 데이터 로딩 워커 수  
  - **DEVICE**: GPU 사용 가능 여부에 따라 "cuda" 또는 "cpu" 선택

### Batch 처리 및 fallback 메커니즘

- batch 처리를 위해 PyTorch의 DataLoader와 커스텀 collate 함수(`custom_collate_fn`)를 사용하여 이미지와 파일 경로를 함께 로드
- batch 처리 중 오류가 발생하면, 각 이미지를 개별적으로 처리하여 캡션 생성을 시도

## to_csv.py

### 기능 및 동작 로직

- `refine.py` 또는 `image_caption.py`를 통해 생성된 JSON 파일을 머신러닝 학습에 적합한 형태의 **CSV 파일로 변환**
- `post` 또는 `reel` 중 하나의 타입만 선택적으로 변환 가능 (`Config.TYPE`)
- 구조가 다른 두 JSON 포맷을 통합 처리하지 않고, 명시된 타입만 변환
- caption의 경우 `\n`으로 분리된 여러 줄을 구분자(`|||`)로 이어붙여 하나의 필드로 저장
  - ex: `"문장1\n\n\n문장2"` → `"문장1|||문장2"`  
- 리스트 형태의 `hashtags`, `mentions`, `images` 등은 쉼표 `,`로 연결된 문자열로 저장

### 주요 기능

- **Impression Score 계산 (옵션)**  
  - 설정에 따라 `(likesCount + commentsCount) / followersCount`를 계산하여 `impression` 컬럼으로 추가
  - 비율 정보로서 콘텐츠의 반응도를 수치로 파악할 수 있음
  - `Config.ENABLE_IMPRESSION = True`일 경우 자동 계산

- **UTF-8 BOM 적용 저장**  
  - 한글 데이터가 포함되어 있어도 CSV 파일이 깨지지 않도록 `"utf-8-sig"` 인코딩으로 저장

### 주요 설정 값

- **타입 지정**:  
  - `Config.TYPE`: `"post"` 또는 `"reel"` 중 선택

- **캡션 처리**:  
  - `\n`이 여러 개 있을 경우 `\n+`로 축소 후 구분자 `|||`로 결합

- **Impression 계산 옵션**:  
  - `Config.ENABLE_IMPRESSION`: True로 설정 시 `likes + comments / followers` 컬럼 생성


## 사용 방법

1. **데이터 준비**:  
   - `post.json`, `reels.json`, `profile.json` 파일을 레포지토리 root directory에 준비

2. **이미지 다운로드 및 데이터 병합 (refine.py 실행)**:
   ```bash
   python refine.py
   ```
   - 실행 후 지정된 모드에 따라 데이터를 병합하고, 이미지가 다운로드된 최종 JSON 파일을 생성

3. **캡션 생성 (image_caption.py 실행)**:
   ```bash
   python image_caption.py
   ```
   - refine.py에서 생성된 JSON 파일의 이미지에 대해 캡션을 생성하고, 결과가 포함된 새로운 JSON 파일을 저장

4. **CSV 변환 (to_csv.py 실행)**:
    ```bash
    python to_csv.py
    ```

   - `Config.TYPE`, `Config.INPUT_JSON_PATH`, `Config.ENABLE_IMPRESSION` 등의 설정 값을 변경하여 원하는 데이터 타입 및 출력 내용을 조정 가능
   - 실행 결과는 동일한 위치에 `.csv` 파일로 저장됨
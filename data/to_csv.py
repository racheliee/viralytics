import json
import csv
import re
import os

# ===== 설정 =====
class Config:
    TYPE = "post"  # "post" 또는 "reel"
    INPUT_JSON_PATH = "merged_dataset_post_with_images_with_captions.json"
    CAPTION_SEPARATOR = "|||"
    ENABLE_IMPRESSION = True  # impression 컬럼 추가 여부

# ===== 내부 경로 설정 =====
input_path = Config.INPUT_JSON_PATH
output_path = input_path.replace(".json", ".csv")

# ===== 헬퍼 함수 =====
def list_to_str(value):
    return ', '.join(value) if isinstance(value, list) else ''

def normalize_and_join_caption(caption: str, sep: str = Config.CAPTION_SEPARATOR):
    if not caption:
        return ""
    normalized = re.sub(r'\n+', '\n', caption)
    lines = [line.strip() for line in normalized.split('\n') if line.strip()]
    return sep.join(lines)

def calculate_impression(likes, comments, followers):
    try:
        return round((likes + comments) / followers, 6) if followers else 0.0
    except Exception:
        return 0.0

# ===== 필드 구성 =====
BASE_FIELDS = [
    "caption", "hashtags", "mentions",
    "commentsCount", "likesCount", "timestamp",
    "owner_id", "owner_fullName", "owner_verified", "owner_biography",
    "owner_followersCount", "owner_businessCategoryName", "owner_postsCount"
]

if Config.ENABLE_IMPRESSION:
    BASE_FIELDS.append("impression")

POST_EXTRA_FIELDS = ["isSponsored", "images", "image_captions"]
REEL_EXTRA_FIELDS = ["videoViewCount", "videoPlayCount", "videoDuration", "audio_id"]

POST_FIELDS = BASE_FIELDS + POST_EXTRA_FIELDS
REEL_FIELDS = BASE_FIELDS + REEL_EXTRA_FIELDS

# ===== 플래튼 함수 =====
def flatten_post(post):
    base = {
        "caption": normalize_and_join_caption(post.get("caption", "")),
        "hashtags": list_to_str(post.get("hashtags", [])),
        "mentions": list_to_str(post.get("mentions", [])),
        "commentsCount": post.get("commentsCount"),
        "likesCount": post.get("likesCount"),
        "timestamp": post.get("timestamp"),
        "owner_id": post["owner"].get("id"),
        "owner_fullName": post["owner"].get("fullName"),
        "owner_verified": post["owner"].get("verified"),
        "owner_biography": post["owner"].get("biography"),
        "owner_followersCount": post["owner"].get("followersCount"),
        "owner_businessCategoryName": post["owner"].get("businessCategoryName"),
        "owner_postsCount": post["owner"].get("postsCount"),
        "isSponsored": post.get("isSponsored", False),
        "images": list_to_str(post.get("images", [])),
        "image_captions": list_to_str(post.get("image_captions", [])),
    }
    if Config.ENABLE_IMPRESSION:
        base["impression"] = calculate_impression(
            post.get("likesCount", 0),
            post.get("commentsCount", 0),
            post["owner"].get("followersCount", 1)
        )
    return base

def flatten_reel(reel):
    base = {
        "caption": normalize_and_join_caption(reel.get("caption", "")),
        "hashtags": list_to_str(reel.get("hashtags", [])),
        "mentions": list_to_str(reel.get("mentions", [])),
        "commentsCount": reel.get("commentsCount"),
        "likesCount": reel.get("likesCount"),
        "timestamp": reel.get("timestamp"),
        "owner_id": reel["owner"].get("id"),
        "owner_fullName": reel["owner"].get("fullName"),
        "owner_verified": reel["owner"].get("verified"),
        "owner_biography": reel["owner"].get("biography"),
        "owner_followersCount": reel["owner"].get("followersCount"),
        "owner_businessCategoryName": reel["owner"].get("businessCategoryName"),
        "owner_postsCount": reel["owner"].get("postsCount"),
        "videoViewCount": reel.get("videoViewCount"),
        "videoPlayCount": reel.get("videoPlayCount"),
        "videoDuration": reel.get("videoDuration"),
        "audio_id": reel.get("audio_id"),
    }
    if Config.ENABLE_IMPRESSION:
        base["impression"] = calculate_impression(
            reel.get("likesCount", 0),
            reel.get("commentsCount", 0),
            reel["owner"].get("followersCount", 1)
        )
    return base

# ===== 실행 =====
try:
    with open(input_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            print(f"파일 '{input_path}'의 내용이 유효한 JSON 형식이 아닙니다.")
            exit(1)
except FileNotFoundError:
    print(f"파일을 찾을 수 없습니다: {input_path}")
    exit(1)
except PermissionError:
    print(f"파일 열기 권한이 없습니다: {input_path}")
    exit(1)
except Exception as e:
    print(f"파일 읽기 오류: {e}")
    exit(1)

if Config.TYPE == "post":
    fieldnames = POST_FIELDS
    rows = [flatten_post(item) for item in data if item.get("type") == "post"]

elif Config.TYPE == "reel":
    fieldnames = REEL_FIELDS
    rows = [flatten_reel(item) for item in data if item.get("type") == "reel"]

else:
    raise ValueError("Config.TYPE은 'post' 또는 'reel'이어야 합니다.")

# ===== CSV 저장 =====
with open(output_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV 저장 완료: {output_path}")

import os
import base64
import requests
import pymysql
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from plant import identify_plant
from dalle_client import generate_plant_image
from utils.db import save_image_metadata
import boto3
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://15.168.150.125:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ DB 연결 설정
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "cursorclass": pymysql.cursors.DictCursor,
    "autocommit": True
}

# ✅ S3 설정
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name="ap-northeast-2"
)
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# ✅ remove.bg 함수
def remove_background_from_url(image_url: str) -> bytes | None:
    try:
        response = requests.post(
            "https://api.remove.bg/v1.0/removebg",
            data={"image_url": image_url, "size": "auto"},
            headers={"X-Api-Key": os.getenv("REMOVEBG_API_KEY")},
        )
        if response.status_code == 200:
            return response.content
        else:
            print("❌ 누끼 제거 실패:", response.status_code, response.text)
            return None
    except Exception as e:
        print("❌ remove.bg 요청 오류:", e)
        return None

# ✅ S3 업로드 함수
def upload_to_s3(file_bytes: bytes, filename: str) -> str:
    s3_key = f"plantimage/generated/{filename}"
    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=s3_key,
        Body=file_bytes,
        ContentType="image/png"
    )
    return f"https://{S3_BUCKET_NAME}.s3.ap-northeast-2.amazonaws.com/{s3_key}"

# ✅ DB 유틸: plant_id 가져오기 (없으면 추가)
def get_or_create_plant_id(scientific_name: str) -> int:
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT plant_id FROM plants WHERE scientific_name = %s", (scientific_name,))
            row = cursor.fetchone()
            if row:
                return row["plant_id"]
            cursor.execute("INSERT INTO plants (scientific_name) VALUES (%s)", (scientific_name,))
            return cursor.lastrowid
    finally:
        conn.close()

# ✅ DB 유틸: user_plant_id 가져오기 (없으면 추가)
def get_or_create_user_plant_id(user_id: int, plant_id: int) -> int:
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT user_plant_id FROM user_plants WHERE user_id = %s AND plant_id = %s",
                (user_id, plant_id)
            )
            row = cursor.fetchone()
            if row:
                return row["user_plant_id"]
            cursor.execute(
                "INSERT INTO user_plants (user_id, plant_id, registered_at) VALUES (%s, %s, NOW())",
                (user_id, plant_id)
            )
            return cursor.lastrowid
    finally:
        conn.close()

# ✅ DB 유틸: uploaded_plant_photos 저장
def insert_uploaded_plant_photo(user_id: int, plant_id: int):
    conn = pymysql.connect(**DB_CONFIG)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO uploaded_plant_photos (user_id, plant_id, uploaded_at) VALUES (%s, %s, NOW())",
                (user_id, plant_id)
            )
    finally:
        conn.close()

# ✅ 메인 엔드포인트
@app.post("/identify")
async def identify(file: UploadFile = File(...), user_id: int = Form(...)):
    image_bytes = await file.read()

    # ✅ 식물 분석
    results = identify_plant(image_bytes)
    if not results:
        return {
            "plant_name_en": "Unknown",
            "plant_name_kr": "알 수 없음",
            "confidence": None,
            "image_url": None,
            "removed_bg_image_url": None
        }

    top_result = results[0]
    scientific_name = top_result.get("species", {}).get("scientificNameWithoutAuthor", "Unknown")
    score = round(top_result.get("score", 0) * 100, 1)

    # ✅ DALL·E 이미지 생성
    image_url = generate_plant_image(scientific_name)

    # ✅ 누끼 처리
    removed_bg_bytes = remove_background_from_url(image_url)

    # ✅ S3 업로드
    dalle_bytes = requests.get(image_url).content
    dalle_filename = f"dalle_{scientific_name}.png"
    removed_filename = f"removedbg_{scientific_name}.png"

    dalle_url = upload_to_s3(dalle_bytes, dalle_filename)
    removed_url = upload_to_s3(removed_bg_bytes, removed_filename) if removed_bg_bytes else None

    # ✅ 이미지 메타 저장
    save_image_metadata(
        user_id=user_id,
        plant_name=scientific_name,
        confidence=score,
        dalle_url=dalle_url,
        removed_url=removed_url
    )

    # ✅ 관계 테이블 저장
    plant_id = get_or_create_plant_id(scientific_name)
    user_plant_id = get_or_create_user_plant_id(user_id, plant_id)
    insert_uploaded_plant_photo(user_id, plant_id)

    return {
        "plant_name_en": scientific_name,
        "plant_name_kr": "자동 번역됨",
        "confidence": score,
        "image_url": dalle_url,
        "removed_bg_image_url": removed_url
    }
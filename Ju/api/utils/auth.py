from fastapi import Request, HTTPException
from jose import jwt, JWTError
import os

# 환경변수에서 키 불러오기
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

def get_current_user_id(request: Request) -> int:
    """요청의 Authorization 헤더에서 JWT를 파싱하여 user_id(sub)를 반환"""
    token = request.headers.get("Authorization")
    if token is None or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰이 없습니다.")

    try:
        payload = jwt.decode(token[7:], SECRET_KEY, algorithms=[ALGORITHM])  # "Bearer " 제거
        user_id = int(payload.get("sub"))
        return user_id
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")

def get_current_user_id_or_none(request: Request) -> int | None:
    """요청의 Authorization 헤더에서 JWT를 파싱하여 user_id 반환, 없으면 None"""
    token = request.headers.get("Authorization")
    if token is None or not token.startswith("Bearer "):
        return None

    try:
        payload = jwt.decode(token[7:], SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except (JWTError, ValueError):
        return None

"""
KingPanel — 文件上传 API
POST /api/upload          上传图片
"""
import secrets
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from db import UPLOAD_DIR

router = APIRouter()

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024


@router.post("/api/upload")
def upload_file(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower() if file.filename else ".png"
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "不支持的图片格式")

    content = file.file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "图片不能超过 5MB")

    name = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}{ext}"
    path = UPLOAD_DIR / name
    path.write_bytes(content)

    return {"path": f"./uploads/{name}"}

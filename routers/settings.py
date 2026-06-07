"""
KingPanel — 设置 API
GET /api/settings        获取设置
PUT /api/settings        更新设置
"""
from fastapi import APIRouter

from db import get_db

router = APIRouter()


@router.get("/api/settings")
def get_settings():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM settings").fetchall()
    return {r["key"]: r["value"] for r in rows}


@router.put("/api/settings")
def update_settings(data: dict):
    allowed = {"logoText", "heroText", "backgroundImage", "theme"}
    with get_db() as conn:
        for k, v in data.items():
            if k in allowed:
                conn.execute(
                    "UPDATE settings SET value=? WHERE key=?", (str(v), k))
        conn.commit()
    return {"ok": True}

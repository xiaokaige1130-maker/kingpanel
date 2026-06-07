"""
KingPanel — Favicon API
GET /api/favicon?url=...  返回 favicon URL
"""
from urllib.parse import urlparse

from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/api/favicon")
def fetch_favicon(url: str = Query(...)):
    icon = ""
    if url:
        try:
            parsed = urlparse(
                url if url.startswith("http") else f"https://{url}")
            domain = parsed.hostname
            if domain:
                icon = f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
        except Exception:
            pass
    return {"icon": icon}

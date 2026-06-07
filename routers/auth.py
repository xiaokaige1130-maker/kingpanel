"""
KingPanel — 简单密码鉴权
POST /api/auth/login   使用面板密码登录
POST /api/auth/logout  清除登录状态
GET  /api/auth/status  查询登录状态
"""
from __future__ import annotations

import hashlib
import os
import secrets
import time
from collections import defaultdict

from fastapi import APIRouter, Cookie, Request, Response
from pydantic import BaseModel

AUTH_COOKIE = "kingpanel_auth"
AUTH_PASSWORD = os.getenv("KINGPANEL_PASSWORD")
if not AUTH_PASSWORD:
    raise RuntimeError("KINGPANEL_PASSWORD must be set before starting KingPanel")
AUTH_TOKEN = hashlib.sha256(f"kingpanel:{AUTH_PASSWORD}".encode()).hexdigest()
COOKIE_SECURE = os.getenv("KINGPANEL_COOKIE_SECURE", "0") == "1"
MAX_FAILURES = 5
LOCK_SECONDS = 60

router = APIRouter()
_failed_logins: dict[str, list[float]] = defaultdict(list)


class LoginRequest(BaseModel):
    password: str


def is_authenticated(token: str | None) -> bool:
    return bool(token) and secrets.compare_digest(token, AUTH_TOKEN)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _is_locked(ip: str) -> bool:
    now = time.time()
    recent = [ts for ts in _failed_logins[ip] if now - ts < LOCK_SECONDS]
    _failed_logins[ip] = recent
    return len(recent) >= MAX_FAILURES


@router.get("/api/auth/status")
def auth_status(response: Response, kingpanel_auth: str | None = Cookie(None)):
    authed = is_authenticated(kingpanel_auth)
    if not authed:
        response.delete_cookie(AUTH_COOKIE, path="/")
    return {"authenticated": authed}


@router.post("/api/auth/login")
def login(data: LoginRequest, request: Request, response: Response):
    ip = _client_ip(request)
    if _is_locked(ip):
        response.status_code = 429
        return {"ok": False, "message": "尝试次数过多，请稍后再试"}

    if not secrets.compare_digest(data.password, AUTH_PASSWORD):
        _failed_logins[ip].append(time.time())
        response.status_code = 401
        return {"ok": False, "message": "密码错误"}

    _failed_logins.pop(ip, None)

    response.set_cookie(
        AUTH_COOKIE,
        AUTH_TOKEN,
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        path="/",
        max_age=60 * 60 * 24 * 30,
    )
    return {"ok": True}


@router.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie(AUTH_COOKIE, path="/")
    return {"ok": True}

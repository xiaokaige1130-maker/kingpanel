"""
KingPanel — 轻量导航面板
FastAPI + SQLite，模块化结构
"""
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from db import init_db, auto_migrate
from routers.data import router as data_router
from routers.categories import router as categories_router
from routers.items import router as items_router
from routers.settings import router as settings_router
from routers.upload import router as upload_router
from routers.import_export import router as import_export_router
from routers.favicon import router as favicon_router
from routers.ops import router as ops_router
from routers.auth import AUTH_COOKIE, is_authenticated, router as auth_router

SITE_DIR = Path(__file__).parent / "site"

app = FastAPI(title="KingPanel")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def require_api_auth(request: Request, call_next):
    path = request.url.path
    public_api_paths = {"/api/auth/login", "/api/auth/logout", "/api/auth/status"}
    if path.startswith("/api/") and path not in public_api_paths:
        if not is_authenticated(request.cookies.get(AUTH_COOKIE)):
            from fastapi.responses import JSONResponse

            return JSONResponse({"detail": "未登录"}, status_code=401)
    return await call_next(request)

# ── Register routers ─────────────────────────────────────────────────
app.include_router(data_router)
app.include_router(categories_router)
app.include_router(items_router)
app.include_router(settings_router)
app.include_router(upload_router)
app.include_router(import_export_router)
app.include_router(favicon_router)
app.include_router(ops_router)
app.include_router(auth_router)


@app.on_event("startup")
def startup():
    init_db()
    auto_migrate()


# ── Static files ──────────────────────────────────────────────────────
@app.get("/")
def serve_index():
    return FileResponse(str(SITE_DIR / "index.html"))


app.mount("/", StaticFiles(directory=str(SITE_DIR), html=True), name="site")


# ── Entry ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    auto_migrate()
    print("=" * 48)
    print("  KingPanel 已启动")
    print("  http://localhost:5180")
    print("  UI + 管理都在主页面")
    print("=" * 48)
    uvicorn.run(app, host="0.0.0.0", port=5180)

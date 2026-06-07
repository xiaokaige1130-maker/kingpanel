"""
KingPanel — 导入/导出 API
GET  /api/export          导出全量数据为 JSON
POST /api/import          导入 JSON 覆盖数据
"""
import json
import shutil
from datetime import datetime

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from db import get_db, get_db_path

router = APIRouter()
MAX_IMPORT_BYTES = 2 * 1024 * 1024


def _backup_db() -> str | None:
    db_path = get_db_path()
    if not db_path.exists():
        return None
    backup = db_path.with_name(
        f"{db_path.name}.bak.{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    )
    shutil.copy2(db_path, backup)
    return backup.name


def _get_favicon_url(url: str) -> str:
    from urllib.parse import urlparse
    if not url:
        return ""
    try:
        domain = urlparse(
            url if url.startswith("http") else f"https://{url}").hostname
        if domain:
            return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"
    except Exception:
        pass
    return ""


@router.get("/api/export")
def export_data():
    with get_db() as conn:
        categories = conn.execute(
            "SELECT * FROM categories ORDER BY sort_order, id").fetchall()
        items = conn.execute(
            "SELECT * FROM items ORDER BY sort_order, id").fetchall()
        settings = {
            r["key"]: r["value"]
            for r in conn.execute("SELECT * FROM settings").fetchall()
        }

    items_by_cat: dict[int, list[dict]] = {}
    for item in items:
        items_by_cat.setdefault(item["category_id"], []).append({
            "title": item["title"],
            "url": item["url"],
            "lanUrl": item["lan_url"],
            "description": item["description"],
            "icon": item["icon"],
            "hostType": item["host_type"],
        })

    data = {
        "version": 2,
        "exportedAt": datetime.now().isoformat(),
        "config": {
            "logoText": settings.get("logoText", "网址导航"),
            "heroText": settings.get("heroText", ""),
            "backgroundImage": settings.get("backgroundImage", ""),
        },
        "categories": [
            {"title": c["title"], "items": items_by_cat.get(c["id"], [])}
            for c in categories
        ]
    }

    return JSONResponse(
        content=data,
        headers={
            "Content-Disposition":
            "attachment; filename=kingpanel-backup.json"
        })


@router.post("/api/import")
def import_data(file: UploadFile = File(...)):
    raw = file.file.read(MAX_IMPORT_BYTES + 1)
    if len(raw) > MAX_IMPORT_BYTES:
        raise HTTPException(413, "导入文件不能超过 2MB")
    try:
        data = json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise HTTPException(400, "JSON 格式不正确") from exc
    if not isinstance(data.get("categories", []), list):
        raise HTTPException(400, "导入文件缺少 categories 数组")

    backup_name = _backup_db()
    with get_db() as conn:
        conn.execute("DELETE FROM items")
        conn.execute("DELETE FROM categories")

        config = data.get("config", {})
        key_map = {
            "logoText": "logoText",
            "heroText": "heroText",
            "backgroundImage": "backgroundImage",
        }
        for k, v in config.items():
            if k in key_map:
                conn.execute(
                    "UPDATE settings SET value=? WHERE key=?",
                    (str(v), key_map[k]))

        for gidx, group in enumerate(data.get("categories", [])):
            cur = conn.execute(
                "INSERT INTO categories (title, sort_order) VALUES (?, ?)",
                (group.get("title", "未命名"), gidx))
            cat_id = cur.lastrowid
            for iidx, item in enumerate(group.get("items", [])):
                url = item.get("url", "")
                icon = item.get("icon", "")
                if not icon and url:
                    icon = _get_favicon_url(url)
                conn.execute(
                    """INSERT INTO items
                       (category_id, title, url, lan_url, description, icon, host_type, sort_order)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                    (cat_id, item.get("title", ""), url,
                     item.get("lanUrl", ""), item.get("description", ""),
                     icon, item.get("hostType", "wan"), iidx))

        conn.commit()

    suffix = f"，已备份 {backup_name}" if backup_name else ""
    return {"ok": True, "message": f"导入成功{suffix}"}

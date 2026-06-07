"""
KingPanel — 站点 CRUD API
POST   /api/items              创建站点
PUT    /api/items/{id}         更新站点
DELETE /api/items/{id}         删除站点
POST   /api/items/{id}/visit   记录访问
PUT    /api/items/reorder      排序站点
"""
from urllib.parse import urlparse
from fastapi import APIRouter, Form, HTTPException

from db import get_db
from models import ItemOut

router = APIRouter()


def _get_favicon_url(url: str) -> str:
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


@router.post("/api/items")
def create_item(
    category_id: int = Form(...),
    title: str = Form(...),
    url: str = Form(""),
    lan_url: str = Form(""),
    description: str = Form(""),
    icon: str = Form(""),
    host_type: str = Form("wan"),
):
    with get_db() as conn:
        cat = conn.execute(
            "SELECT id FROM categories WHERE id=?", (category_id,)).fetchone()
        if not cat:
            raise HTTPException(404, "分类不存在")

        max_order = conn.execute(
            "SELECT COALESCE(MAX(sort_order), -1) FROM items WHERE category_id=?",
            (category_id,)).fetchone()[0]

        if not icon and url:
            icon = _get_favicon_url(url)

        cur = conn.execute(
            """INSERT INTO items
               (category_id, title, url, lan_url, description, icon, host_type, sort_order)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (category_id, title, url, lan_url, description, icon, host_type,
             max_order + 1))
        item = conn.execute(
            "SELECT * FROM items WHERE id=?", (cur.lastrowid,)).fetchone()
        conn.commit()
    return ItemOut.model_validate(dict(item)).model_dump(by_alias=True)


@router.put("/api/items/{item_id}")
def update_item(
    item_id: int,
    title: str = Form(...),
    url: str = Form(""),
    lan_url: str = Form(""),
    description: str = Form(""),
    icon: str = Form(""),
    host_type: str = Form("wan"),
):
    with get_db() as conn:
        conn.execute(
            """UPDATE items SET title=?, url=?, lan_url=?, description=?,
               icon=?, host_type=?, updated_at=datetime('now','localtime')
               WHERE id=?""",
            (title, url, lan_url, description, icon, host_type, item_id))
        item = conn.execute(
            "SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
        conn.commit()
    if not item:
        raise HTTPException(404, "站点不存在")
    return ItemOut.model_validate(dict(item)).model_dump(by_alias=True)


@router.delete("/api/items/{item_id}")
def delete_item(item_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM items WHERE id=?", (item_id,))
        conn.commit()
    return {"ok": True}


@router.post("/api/items/{item_id}/visit")
def visit_item(item_id: int):
    with get_db() as conn:
        conn.execute(
            """UPDATE items
               SET click_count=COALESCE(click_count, 0) + 1,
                   last_opened_at=datetime('now','localtime')
               WHERE id=?""",
            (item_id,))
        item = conn.execute(
            "SELECT * FROM items WHERE id=?", (item_id,)).fetchone()
        conn.commit()
    if not item:
        raise HTTPException(404, "站点不存在")
    return ItemOut.model_validate(dict(item)).model_dump(by_alias=True)


@router.put("/api/items/reorder")
def reorder_items(data: dict):
    with get_db() as conn:
        for idx, item_id in enumerate(data.get("order", [])):
            conn.execute(
                "UPDATE items SET sort_order=? WHERE id=?", (idx, item_id))
        conn.commit()
    return {"ok": True}

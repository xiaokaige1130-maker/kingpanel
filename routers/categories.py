"""
KingPanel — 分类 CRUD API
POST   /api/categories           创建分类
PUT    /api/categories/{id}      更新分类
DELETE /api/categories/{id}      删除分类（级联删除站点）
PUT    /api/categories/reorder   排序分类
"""
from fastapi import APIRouter, Form, HTTPException

from db import get_db
from models import CategoryOut

router = APIRouter()


@router.post("/api/categories")
def create_category(title: str = Form(...)):
    with get_db() as conn:
        max_order = conn.execute(
            "SELECT COALESCE(MAX(sort_order), -1) FROM categories").fetchone()[0]
        cur = conn.execute(
            "INSERT INTO categories (title, sort_order) VALUES (?, ?)",
            (title, max_order + 1))
        cat = conn.execute(
            "SELECT * FROM categories WHERE id=?", (cur.lastrowid,)).fetchone()
        conn.commit()
    return CategoryOut.model_validate(dict(cat)).model_dump(by_alias=True)


@router.put("/api/categories/{cat_id}")
def update_category(cat_id: int, title: str = Form(...)):
    with get_db() as conn:
        conn.execute(
            "UPDATE categories SET title=?, updated_at=datetime('now','localtime') WHERE id=?",
            (title, cat_id))
        cat = conn.execute(
            "SELECT * FROM categories WHERE id=?", (cat_id,)).fetchone()
        conn.commit()
    if not cat:
        raise HTTPException(404, "分类不存在")
    return CategoryOut.model_validate(dict(cat)).model_dump(by_alias=True)


@router.delete("/api/categories/{cat_id}")
def delete_category(cat_id: int):
    with get_db() as conn:
        conn.execute("DELETE FROM items WHERE category_id=?", (cat_id,))
        conn.execute("DELETE FROM categories WHERE id=?", (cat_id,))
        conn.commit()
    return {"ok": True}


@router.put("/api/categories/reorder")
def reorder_categories(data: dict):
    with get_db() as conn:
        for idx, cid in enumerate(data.get("order", [])):
            conn.execute(
                "UPDATE categories SET sort_order=? WHERE id=?", (idx, cid))
        conn.commit()
    return {"ok": True}

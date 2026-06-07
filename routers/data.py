"""
KingPanel — 数据汇总 API
GET /api/data — 返回全部 categories + items + settings
"""
from fastapi import APIRouter

from db import get_db
from models import CategoryOut, ItemOut

router = APIRouter()


@router.get("/api/data")
def get_all_data():
    with get_db() as conn:
        categories = conn.execute(
            "SELECT * FROM categories ORDER BY sort_order, id").fetchall()
        items = conn.execute(
            """SELECT * FROM items
               ORDER BY click_count DESC, last_opened_at DESC, sort_order, id"""
        ).fetchall()
        settings_rows = conn.execute("SELECT * FROM settings").fetchall()

    items_by_cat: dict[int, list[dict]] = {}
    for item in items:
        items_by_cat.setdefault(
            item["category_id"], []).append(
            ItemOut.model_validate(dict(item)).model_dump(by_alias=True))

    result = {
        "settings": {r["key"]: r["value"] for r in settings_rows},
        "categories": []
    }
    for cat in categories:
        d = CategoryOut.model_validate(dict(cat)).model_dump(by_alias=True)
        d["items"] = items_by_cat.get(cat["id"], [])
        result["categories"].append(d)

    return result

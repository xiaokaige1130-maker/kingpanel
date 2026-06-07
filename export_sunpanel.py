#!/usr/bin/env python3
import json
import sqlite3
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
SOURCE_DB = ROOT / "source" / "database.db"
SITE_DIR = ROOT / "site"
CONFIG_JS = SITE_DIR / "config.js"
DATA_JS = SITE_DIR / "data.js"


def _load_rows(conn):
    conn.row_factory = sqlite3.Row
    return conn.execute(
        """
        select
          g.id as group_id,
          g.title as group_title,
          g.sort as group_sort,
          g.icon as group_icon,
          g.card_style,
          i.id as item_id,
          i.title,
          i.url,
          i.lan_url,
          i.description,
          i.sort as item_sort,
          i.icon_json,
          i.background_color
        from item_icon_group g
        left join item_icon i
          on i.item_icon_group_id = g.id
         and i.deleted_at is null
        where g.deleted_at is null
        order by g.sort, g.id, i.sort, i.id
        """
    ).fetchall()


def _normalize_icon_src(raw):
    if not raw:
      return ""
    if raw.startswith("/uploads/"):
      return "." + raw
    if raw.startswith("/"):
      return "./uploads" + raw
    return raw


def _host_type(url):
    try:
        parsed = urlparse(url)
        host = parsed.hostname or ""
    except Exception:
        host = ""
    if host.startswith("192.168.") or host.startswith("10.") or host.startswith("172."):
        return "lan"
    return "wan"


def build_payload():
    conn = sqlite3.connect(SOURCE_DB)
    rows = _load_rows(conn)

    panel_json_raw = conn.execute("select panel_json from user_config where user_id = 1").fetchone()
    panel_json = json.loads(panel_json_raw[0]) if panel_json_raw and panel_json_raw[0] else {}

    groups = []
    by_group = {}

    for row in rows:
        group_id = row["group_id"]
        if group_id not in by_group:
            group = {
                "id": group_id,
                "title": row["group_title"],
                "items": [],
            }
            by_group[group_id] = group
            groups.append(group)

        if row["item_id"] is None:
            continue

        icon_json = {}
        if row["icon_json"]:
            try:
                icon_json = json.loads(row["icon_json"])
            except json.JSONDecodeError:
                icon_json = {}

        url = (row["url"] or "").strip()
        lan_url = (row["lan_url"] or "").strip()

        by_group[group_id]["items"].append(
            {
                "id": row["item_id"],
                "title": (row["title"] or "").strip() or "未命名站点",
                "url": url or lan_url,
                "lanUrl": lan_url,
                "description": (row["description"] or "").strip(),
                "icon": _normalize_icon_src(icon_json.get("src", "")),
                "hostType": _host_type(url or lan_url),
                "hasDescription": bool((row["description"] or "").strip()),
            }
        )

    config = {
        "logoText": panel_json.get("logoText") or "网址导航",
        "backgroundImage": _normalize_icon_src(panel_json.get("backgroundImageSrc", "")),
        "heroText": "已从 NAS 上的 Sun-Panel 数据迁移到当前静态版本。",
    }
    return config, groups


def write_js(var_name, payload, target):
    target.write_text(
        f"window.{var_name} = {json.dumps(payload, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )


def main():
    config, groups = build_payload()
    SITE_DIR.mkdir(parents=True, exist_ok=True)
    write_js("NAV_CONFIG", config, CONFIG_JS)
    write_js("NAV_DATA", groups, DATA_JS)
    total = sum(len(group["items"]) for group in groups)
    print(f"exported {len(groups)} groups, {total} items")


if __name__ == "__main__":
    main()

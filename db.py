"""
KingPanel — 数据库层
SQLite 连接管理、初始化、自动迁移
"""
from __future__ import annotations

import json
import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from threading import Lock
from typing import Optional

_db_lock = Lock()
DB_PATH = Path(__file__).parent / "nav.db"
SITE_DIR = Path(__file__).parent / "site"
UPLOAD_DIR = SITE_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_db_path() -> Path:
    return DB_PATH


@contextmanager
def get_db():
    """上下文管理器，自动 commit/close"""
    with _db_lock:
        conn = sqlite3.connect(str(DB_PATH))
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        try:
            yield conn
        finally:
            conn.close()


def init_db() -> None:
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS categories (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                title       TEXT NOT NULL,
                sort_order  INTEGER DEFAULT 0,
                created_at  TEXT DEFAULT (datetime('now','localtime')),
                updated_at  TEXT DEFAULT (datetime('now','localtime'))
            );
            CREATE TABLE IF NOT EXISTS items (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                title       TEXT NOT NULL DEFAULT '',
                url         TEXT NOT NULL DEFAULT '',
                lan_url     TEXT DEFAULT '',
                description TEXT DEFAULT '',
                icon        TEXT DEFAULT '',
                host_type   TEXT DEFAULT 'wan',
                click_count INTEGER DEFAULT 0,
                last_opened_at TEXT DEFAULT '',
                sort_order  INTEGER DEFAULT 0,
                created_at  TEXT DEFAULT (datetime('now','localtime')),
                updated_at  TEXT DEFAULT (datetime('now','localtime')),
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            );
            CREATE TABLE IF NOT EXISTS settings (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        """)
        defaults = {
            "logoText": "网址导航",
            "heroText": "收藏你的网络世界",
            "backgroundImage": "",
            "theme": "dark"
        }
        for k, v in defaults.items():
            conn.execute(
                "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", (k, v)
            )
        conn.commit()

        existing = {
            row["name"]
            for row in conn.execute("PRAGMA table_info(items)").fetchall()
        }
        if "click_count" not in existing:
            conn.execute("ALTER TABLE items ADD COLUMN click_count INTEGER DEFAULT 0")
        if "last_opened_at" not in existing:
            conn.execute("ALTER TABLE items ADD COLUMN last_opened_at TEXT DEFAULT ''")
        conn.commit()


def auto_migrate() -> int:
    """从旧 data.js/config.js 迁移数据，返回迁移条数"""
    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        if count > 0:
            return 0

    data_js = SITE_DIR / "data.js"
    config_js = SITE_DIR / "config.js"
    if not data_js.exists():
        return 0

    migrated = 0
    try:
        content = data_js.read_text("utf-8")
        match = re.search(r"window\.NAV_DATA\s*=\s*(\[.*?\]);?\s*$", content, re.DOTALL)
        if match:
            groups = json.loads(match.group(1))
            with get_db() as conn:
                for gidx, group in enumerate(groups):
                    cur = conn.execute(
                        "INSERT INTO categories (title, sort_order) VALUES (?, ?)",
                        (group.get("title", f"分类{gidx+1}"), gidx))
                    cat_id = cur.lastrowid
                    for iidx, item in enumerate(group.get("items", [])):
                        url = item.get("url", "")
                        conn.execute(
                            """INSERT INTO items
                               (category_id, title, url, lan_url, description, icon, host_type, sort_order)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                            (cat_id, item.get("title", ""), url,
                             item.get("lanUrl", ""), item.get("description", ""),
                             item.get("icon", ""), item.get("hostType", "wan"), iidx))
                        migrated += 1
                conn.commit()

        config_match = re.search(
            r"window\.NAV_CONFIG\s*=\s*(\{.*?\});?\s*$",
            config_js.read_text("utf-8"), re.DOTALL)
        if config_match:
            cfg = json.loads(config_match.group(1))
            with get_db() as conn:
                for k, v in cfg.items():
                    conn.execute(
                        "UPDATE settings SET value=? WHERE key=?", (str(v), k))
                conn.commit()

        print(f"  已从 data.js 迁移 {migrated} 个站点")
    except Exception as e:
        print(f"  迁移 data.js 失败: {e}")
    return migrated

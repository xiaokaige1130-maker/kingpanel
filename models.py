"""
KingPanel — Pydantic 数据模型
字段同时支持 snake_case（Python）和 camelCase（前端 JSON），Form 数据用 snake_case
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Category ────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class CategoryUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)


class CategoryOut(BaseModel):
    id: int
    title: str
    sort_order: int = Field(0, alias="sortOrder")
    items: list[ItemOut] = []
    created_at: str = Field("", alias="createdAt")
    updated_at: str = Field("", alias="updatedAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


# ── Item ────────────────────────────────────────────────────────────

class ItemCreate(BaseModel):
    category_id: int = Field(..., alias="categoryId")
    title: str = Field(..., min_length=1, max_length=200)
    url: str = Field("")
    lan_url: str = Field("", alias="lanUrl")
    description: str = Field("")
    icon: str = Field("")
    host_type: str = Field("wan", alias="hostType")

    model_config = {"populate_by_name": True}


class ItemUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    url: str = Field("")
    lan_url: str = Field("", alias="lanUrl")
    description: str = Field("")
    icon: str = Field("")
    host_type: str = Field("wan", alias="hostType")

    model_config = {"populate_by_name": True}


class ItemOut(BaseModel):
    id: int
    category_id: int = Field(alias="categoryId")
    title: str
    url: str
    lan_url: str = Field("", alias="lanUrl")
    description: str = Field("")
    icon: str = Field("")
    host_type: str = Field("wan", alias="hostType")
    click_count: int = Field(0, alias="clickCount")
    last_opened_at: str = Field("", alias="lastOpenedAt")
    sort_order: int = Field(0, alias="sortOrder")
    created_at: str = Field("", alias="createdAt")
    updated_at: str = Field("", alias="updatedAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


# ── Settings ────────────────────────────────────────────────────────

class SettingsUpdate(BaseModel):
    logoText: str = ""
    heroText: str = ""
    backgroundImage: str = ""
    theme: str = "dark"


# ── Reorder ─────────────────────────────────────────────────────────

class ReorderRequest(BaseModel):
    order: list[int]

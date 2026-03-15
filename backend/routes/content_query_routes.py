import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_auth

router = APIRouter(prefix="/api/content", tags=["content-query"])

from database import db

class ContentItem(BaseModel):
    id: str | None = None
    type: str
    title: str
    slug: str
    excerpt: str | None = None
    content: str | None = None
    featuredImage: str | None = None
    category: str | None = None
    tags: list[str] | None = []
    author: str | None = None
    publishedAt: datetime | None = None
    status: str = 'draft'
    metadata: dict[str, Any] | None = {}

class QueryRequest(BaseModel):
    postType: str
    filters: dict[str, Any] | None = {}
    sort: dict[str, Any] | None = {'field': 'publishedAt', 'order': 'desc'}
    limit: int = 10
    offset: int = 0

@router.post("/query")
async def query_content(
    query: QueryRequest,
    user: dict = Depends(require_auth)
):
    """Query content items from database"""
    mongo_filter = {"type": query.postType}

    if query.filters:
        if query.filters.get('category'):
            mongo_filter['category'] = query.filters['category']
        if query.filters.get('status'):
            mongo_filter['status'] = query.filters['status']

    sort_field = query.sort.get('field', 'publishedAt') if query.sort else 'publishedAt'
    sort_order = -1 if (query.sort or {}).get('order', 'desc') == 'desc' else 1

    total = await db.content_items.count_documents(mongo_filter)
    items = await db.content_items.find(
        mongo_filter, {"_id": 0}
    ).sort(sort_field, sort_order).skip(query.offset).limit(query.limit).to_list(query.limit)

    return {
        "items": items,
        "total": total,
        "limit": query.limit,
        "offset": query.offset
    }

@router.post("/items")
async def create_content(
    item: ContentItem,
    user: dict = Depends(require_auth)
):
    """Create new content item"""
    item.id = str(uuid.uuid4())
    item.publishedAt = datetime.now(UTC)
    doc = item.model_dump()
    await db.content_items.insert_one(doc)
    doc.pop('_id', None)
    return {"success": True, "id": item.id, "item": doc}

@router.put("/items/{item_id}")
async def update_content(
    item_id: str,
    item: ContentItem,
    user: dict = Depends(require_auth)
):
    """Update content item"""
    result = await db.content_items.update_one(
        {"id": item_id},
        {"$set": item.model_dump(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Content item not found")
    return {"success": True, "id": item_id}

@router.delete("/items/{item_id}")
async def delete_content(
    item_id: str,
    user: dict = Depends(require_auth)
):
    """Delete content item"""
    result = await db.content_items.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content item not found")
    return {"success": True, "id": item_id}

@router.get("/categories")
async def get_categories(
    content_type: str = 'blog',
    user: dict = Depends(require_auth)
):
    """Get all categories for content type"""
    pipeline = [
        {"$match": {"type": content_type, "category": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await db.content_items.aggregate(pipeline).to_list(100)
    categories = [{"id": r["_id"], "name": r["_id"].title(), "count": r["count"]} for r in results]
    return {"categories": categories}

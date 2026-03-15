"""Reusable CRUD helpers for MongoDB collections."""
import uuid
from datetime import UTC, datetime

from fastapi import HTTPException


async def get_document(collection, query, not_found_msg="Not found"):
    """Find a single document or raise 404."""
    doc = await collection.find_one(query)
    if not doc:
        raise HTTPException(status_code=404, detail=not_found_msg)
    doc.pop("_id", None)
    return doc


async def create_document(collection, data: dict, extra: dict = None):
    """Insert a document with auto-generated id and timestamps."""
    doc = {
        "id": str(uuid.uuid4()),
        **data,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }
    if extra:
        doc.update(extra)
    await collection.insert_one(doc)
    doc.pop("_id", None)
    return doc


async def update_document(collection, query: dict, data: dict, user_id: str = None):
    """Update a document, setting updated_at and optionally updated_by."""
    update_fields = {**data, "updated_at": datetime.now(UTC)}
    if user_id:
        update_fields["updated_by"] = user_id
    result = await collection.update_one(query, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return result


async def upsert_document(collection, query: dict, data: dict, user_id: str = None):
    """Update or insert a document."""
    update_fields = {**query, **data, "updated_at": datetime.now(UTC)}
    if user_id:
        update_fields["updated_by"] = user_id
    await collection.update_one(query, {"$set": update_fields}, upsert=True)


async def list_documents(collection, query: dict = None, sort_field="created_at", sort_dir=-1, skip=0, limit=50):
    """List documents with pagination."""
    q = query or {}
    cursor = collection.find(q).sort(sort_field, sort_dir).skip(skip).limit(limit)
    docs = await cursor.to_list(limit)
    for doc in docs:
        doc.pop("_id", None)
    return docs


async def delete_document(collection, query: dict, not_found_msg="Not found"):
    """Delete a document or raise 404."""
    result = await collection.delete_one(query)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=not_found_msg)

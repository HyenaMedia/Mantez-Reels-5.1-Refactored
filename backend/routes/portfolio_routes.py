import logging
import os
import sys
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

# Configure logger
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from auth import require_auth
from routes.activity_routes import log_activity
from utils.constants import utcnow
from utils.crud import create_document
from utils.decorators import handle_exceptions

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

from database import db


class PortfolioItem(BaseModel):
    title: str
    category: str
    slug: str
    thumbnail_id: str  # Reference to media file_id
    video_url: str | None = None  # YouTube/Vimeo URL or local video file_id
    description: str
    client: str
    year: str
    featured: bool = False
    published: bool = True


class PortfolioItemResponse(PortfolioItem):
    id: str
    created_at: datetime
    updated_at: datetime
    thumbnail_urls: dict  # Resolved thumbnail URLs


class BulkDeleteRequest(BaseModel):
    ids: list[str]


@router.post("/create")
@handle_exceptions("create portfolio item")
async def create_portfolio_item(request: Request, item: PortfolioItem, current_user: dict = Depends(require_auth)):
    """Create a new portfolio item"""
    # Verify thumbnail exists
    thumbnail = await db.media.find_one({'file_id': item.thumbnail_id})
    if not thumbnail:
        raise HTTPException(status_code=404, detail="Thumbnail media not found")

    # Create portfolio document
    portfolio_doc = await create_document(
        db.portfolio,
        item.model_dump(),
        extra={'views': 0},
    )

    # Update media usage
    await db.media.update_one(
        {'file_id': item.thumbnail_id},
        {'$addToSet': {'used_in': {'type': 'portfolio', 'id': portfolio_doc['id']}}}
    )

    # Log activity
    await log_activity(
        user_id=current_user.get("id", "unknown"),
        user_email=current_user.get("email", current_user.get("username", "admin")),
        action_type="create",
        resource_type="portfolio",
        resource_id=portfolio_doc['id'],
        resource_name=item.title,
        ip_address=request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
    )

    return {
        'success': True,
        'id': portfolio_doc['id'],
        'message': 'Portfolio item created successfully'
    }


@router.get("/list")
@handle_exceptions("list portfolio items")
async def list_portfolio_items(
    published_only: bool = True,
    featured_only: bool = False,
    category: str | None = None,
    limit: int = 50
):
    """List portfolio items with filters"""
    query = {}
    if published_only:
        query['published'] = True
    if featured_only:
        query['featured'] = True
    if category:
        query['category'] = category

    items = await db.portfolio.find(query).sort('created_at', -1).limit(limit).to_list(limit)

    # Resolve thumbnail URLs for each item
    result_items = []
    for item in items:
        # Get thumbnail media
        thumbnail = await db.media.find_one({'file_id': item['thumbnail_id']})

        item['_id'] = str(item['_id'])
        item['thumbnail_urls'] = thumbnail['sizes'] if thumbnail else None

        result_items.append(item)

    return {
        'success': True,
        'count': len(result_items),
        'items': result_items
    }


@router.get("/{item_id}")
@handle_exceptions("get portfolio item")
async def get_portfolio_item(item_id: str):
    """Get a single portfolio item by ID"""
    item = await db.portfolio.find_one({'id': item_id})

    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    # Get thumbnail media
    thumbnail = await db.media.find_one({'file_id': item['thumbnail_id']})

    item['_id'] = str(item['_id'])
    item['thumbnail_urls'] = thumbnail['sizes'] if thumbnail else None

    # Increment view count
    await db.portfolio.update_one(
        {'id': item_id},
        {'$inc': {'views': 1}}
    )

    return {
        'success': True,
        'item': item
    }


@router.put("/{item_id}")
@handle_exceptions("update portfolio item")
async def update_portfolio_item(request: Request, item_id: str, item: PortfolioItem, current_user: dict = Depends(require_auth)):
    """Update a portfolio item"""
    existing = await db.portfolio.find_one({'id': item_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    # Verify new thumbnail exists if changed
    if item.thumbnail_id != existing['thumbnail_id']:
        thumbnail = await db.media.find_one({'file_id': item.thumbnail_id})
        if not thumbnail:
            raise HTTPException(status_code=404, detail="Thumbnail media not found")

    # Update document
    update_data = {
        **item.model_dump(),
        'updated_at': utcnow()
    }

    await db.portfolio.update_one(
        {'id': item_id},
        {'$set': update_data}
    )

    # Log activity
    await log_activity(
        user_id=current_user.get("id", "unknown"),
        user_email=current_user.get("email", current_user.get("username", "admin")),
        action_type="update",
        resource_type="portfolio",
        resource_id=item_id,
        resource_name=item.title,
        ip_address=request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
    )

    return {
        'success': True,
        'message': 'Portfolio item updated successfully'
    }


@router.delete("/{item_id}")
@handle_exceptions("delete portfolio item")
async def delete_portfolio_item(request: Request, item_id: str, current_user: dict = Depends(require_auth)):
    """Delete a portfolio item"""
    item = await db.portfolio.find_one({'id': item_id})

    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    # Remove from media usage tracking
    await db.media.update_one(
        {'file_id': item['thumbnail_id']},
        {'$pull': {'used_in': {'type': 'portfolio', 'id': item_id}}}
    )

    # Delete portfolio item
    await db.portfolio.delete_one({'id': item_id})

    # Log activity
    await log_activity(
        user_id=current_user.get("id", "unknown"),
        user_email=current_user.get("email", current_user.get("username", "admin")),
        action_type="delete",
        resource_type="portfolio",
        resource_id=item_id,
        resource_name=item.get('title', 'Unknown'),
        ip_address=request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
    )

    return {
        'success': True,
        'message': 'Portfolio item deleted successfully'
    }


@router.get("/categories/list")
@handle_exceptions("list categories")
async def list_categories():
    """Get all unique categories"""
    categories = await db.portfolio.distinct('category')

    return {
        'success': True,
        'categories': categories
    }


@router.post("/bulk-delete")
@handle_exceptions("bulk delete portfolio items")
async def bulk_delete_portfolio_items(request: Request, bulk_request: BulkDeleteRequest, current_user: dict = Depends(require_auth)):
    """Delete multiple portfolio items at once"""
    if not bulk_request.ids:
        raise HTTPException(status_code=400, detail="No item IDs provided")

    deleted_count = 0
    deleted_names = []

    for item_id in bulk_request.ids:
        item = await db.portfolio.find_one({'id': item_id})

        if item:
            # Remove from media usage tracking
            await db.media.update_one(
                {'file_id': item['thumbnail_id']},
                {'$pull': {'used_in': {'type': 'portfolio', 'id': item_id}}}
            )

            # Delete portfolio item
            result = await db.portfolio.delete_one({'id': item_id})
            if result.deleted_count > 0:
                deleted_count += 1
                deleted_names.append(item.get('title', item_id))

    # Log activity for bulk delete
    await log_activity(
        user_id=current_user.get("id", "unknown"),
        user_email=current_user.get("email", current_user.get("username", "admin")),
        action_type="delete",
        resource_type="portfolio",
        resource_name=f"Bulk delete: {', '.join(deleted_names[:3])}{'...' if len(deleted_names) > 3 else ''}",
        details={"deleted_count": deleted_count, "item_ids": bulk_request.ids},
        ip_address=request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
    )

    return {
        'success': True,
        'message': f'Successfully deleted {deleted_count} portfolio items',
        'deleted_count': deleted_count
    }

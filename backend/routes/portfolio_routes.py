import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

# Configure logger
logger = logging.getLogger(__name__)

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from auth import require_auth
from routes.activity_routes import log_activity

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
async def create_portfolio_item(request: Request, item: PortfolioItem, current_user: dict = Depends(require_auth)):
    """Create a new portfolio item"""
    try:
        # Verify thumbnail exists
        thumbnail = await db.media.find_one({'file_id': item.thumbnail_id})
        if not thumbnail:
            raise HTTPException(status_code=404, detail="Thumbnail media not found")

        # Create portfolio document
        portfolio_doc = {
            'id': str(uuid.uuid4()),
            **item.model_dump(),
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
            'views': 0
        }

        result = await db.portfolio.insert_one(portfolio_doc)
        _ = result  # Acknowledge the result

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

    except Exception as e:
        logger.error(f"Failed to create portfolio item: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create portfolio item")


@router.get("/list")
async def list_portfolio_items(
    published_only: bool = True,
    featured_only: bool = False,
    category: str | None = None,
    limit: int = 50
):
    """List portfolio items with filters"""
    try:
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

    except Exception as e:
        logger.error(f"Failed to list portfolio items: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list portfolio items")


@router.get("/{item_id}")
async def get_portfolio_item(item_id: str):
    """Get a single portfolio item by ID"""
    try:
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

    except Exception as e:
        logger.error(f"Failed to get portfolio item: {e}")
        raise HTTPException(status_code=500, detail="Failed to get portfolio item")


@router.put("/{item_id}")
async def update_portfolio_item(request: Request, item_id: str, item: PortfolioItem, current_user: dict = Depends(require_auth)):
    """Update a portfolio item"""
    try:
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
            'updated_at': datetime.now(timezone.utc)
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

    except Exception as e:
        logger.error(f"Failed to update portfolio item: {e}")
        raise HTTPException(status_code=500, detail="Failed to update portfolio item")


@router.delete("/{item_id}")
async def delete_portfolio_item(request: Request, item_id: str, current_user: dict = Depends(require_auth)):
    """Delete a portfolio item"""
    try:
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

    except Exception as e:
        logger.error(f"Failed to delete portfolio item: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete portfolio item")


@router.get("/categories/list")
async def list_categories():
    """Get all unique categories"""
    try:
        categories = await db.portfolio.distinct('category')

        return {
            'success': True,
            'categories': categories
        }

    except Exception as e:
        logger.error(f"Failed to list categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to list categories")


@router.post("/bulk-delete")
async def bulk_delete_portfolio_items(request: Request, bulk_request: BulkDeleteRequest, current_user: dict = Depends(require_auth)):
    """Delete multiple portfolio items at once"""
    try:
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

    except Exception as e:
        logger.error(f"Failed to bulk delete portfolio items: {e}")
        raise HTTPException(status_code=500, detail="Failed to bulk delete portfolio items")

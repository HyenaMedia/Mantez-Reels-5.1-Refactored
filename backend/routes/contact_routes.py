import html as html_lib
import logging
import os
import sys
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, validator
from slowapi import Limiter

logger = logging.getLogger(__name__)


# Add parent directory to path to import security_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from auth import require_auth
from security_utils import sanitize_text, validate_content_length
from services.email_service import EmailService

router = APIRouter(prefix="/api/contact", tags=["contact"])

from database import db
from utils.network import get_real_ipaddr

# Initialize limiter with custom IP detection
limiter = Limiter(key_func=get_real_ipaddr)


async def send_contact_email_notification(contact_data: dict):
    """Send email notification when a new contact form is submitted"""
    try:
        settings = await db.settings.find_one({})
        if not settings or not settings.get("emailService", {}).get("enabled"):
            logger.info("📧 Email service not enabled, skipping notification")
            return False

        email_service = EmailService(settings["emailService"])
        success = await email_service.send_contact_notification(
            name=contact_data["name"],
            email=contact_data["email"],
            subject=contact_data["subject"],
            message=contact_data["message"]
        )
        return success
    except Exception as e:
        logger.error(f"❌ Failed to send contact notification: {e}")
        return False


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

    @validator('name', 'subject', 'message')
    def sanitize_fields(cls, v):
        """Sanitize text fields to prevent XSS"""
        if v:
            sanitized = sanitize_text(v)
            if not validate_content_length(sanitized, max_length=5000):
                raise ValueError('Content exceeds maximum length')
            return sanitized
        return v


@router.post("/submit")
@limiter.limit("10/minute")  # Prevent spam submissions
async def submit_contact_form(request: Request, contact: ContactMessage):
    """Submit a contact form message"""
    try:
        # Save to database
        contact_doc = {
            'id': str(uuid.uuid4()),
            **contact.model_dump(),
            'status': 'new',  # new, read, replied
            'created_at': datetime.now(timezone.utc),
            'replied_at': None
        }

        await db.contacts.insert_one(contact_doc)

        # Send email notification asynchronously
        email_sent = await send_contact_email_notification(contact.model_dump())

        return {
            'success': True,
            'message': 'Your message has been sent successfully. I will get back to you soon!',
            'email_notification': email_sent
        }

    except Exception as e:
        logger.error(f"Failed to submit contact form: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")


@router.get("/messages")
async def get_contact_messages(
    status: str = None,
    limit: int = 50,
    current_user: dict = Depends(require_auth)
):
    """Get contact messages (admin only - requires authentication)"""
    try:
        query = {}
        if status:
            query['status'] = status

        messages = await db.contacts.find(query).sort('created_at', -1).limit(limit).to_list(limit)

        for msg in messages:
            msg['_id'] = str(msg['_id'])

        return {
            'success': True,
            'count': len(messages),
            'messages': messages
        }

    except Exception as e:
        logger.error(f"Failed to get messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages")


@router.put("/messages/{message_id}/status")
async def update_message_status(
    message_id: str,
    status: str,
    current_user: dict = Depends(require_auth)
):
    """Update contact message status (admin only - requires authentication)"""
    try:
        if status not in ['new', 'read', 'replied']:
            raise HTTPException(status_code=400, detail="Invalid status")

        update_data = {'status': status}
        if status == 'replied':
            update_data['replied_at'] = datetime.now(timezone.utc)

        result = await db.contacts.update_one(
            {'id': message_id},
            {'$set': update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")

        return {
            'success': True,
            'message': 'Status updated successfully'
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update message status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")


@router.patch("/messages/{message_id}")
async def update_message_properties(
    message_id: str,
    read: bool = None,
    starred: bool = None,
    archived: bool = None,
    current_user: dict = Depends(require_auth)
):
    """Update message properties like read, starred, archived status"""
    try:
        update_data = {}
        if read is not None:
            update_data['read'] = read
            # Also update status when marking as read/unread
            if read:
                update_data['status'] = 'read'
            else:
                update_data['status'] = 'new'
        if starred is not None:
            update_data['starred'] = starred
        if archived is not None:
            update_data['archived'] = archived

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        result = await db.contacts.update_one(
            {'id': message_id},
            {'$set': update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")

        return {
            'success': True,
            'message': 'Message updated successfully'
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update message: {e}")
        raise HTTPException(status_code=500, detail="Failed to update message")


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    current_user: dict = Depends(require_auth)
):
    """Delete a contact message"""
    try:
        result = await db.contacts.delete_one({'id': message_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")

        return {
            'success': True,
            'message': 'Message deleted successfully'
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete message: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete message")


class ReplyRequest(BaseModel):
    to: str
    subject: str
    body: str
    message_id: str = None  # Optional: mark the contact message as replied


@router.post("/reply")
async def send_reply(
    reply: ReplyRequest,
    current_user: dict = Depends(require_auth)
):
    """Send a reply email to a contact message"""
    try:
        settings = await db.settings.find_one({})
        if not settings or not settings.get("emailService", {}).get("enabled"):
            raise HTTPException(
                status_code=400,
                detail="Email service not configured. Please enable email service in settings."
            )

        email_service = EmailService(settings["emailService"])

        # Escape user input before injecting into HTML to prevent XSS
        html_body = html_lib.escape(reply.body).replace('\n', '<br>')
        html_content = f"<html><body><p>{html_body}</p></body></html>"

        success = await email_service.send_email(
            to=reply.to,
            subject=reply.subject,
            html_content=html_content,
            text_content=reply.body
        )

        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email")

        # Mark the contact message as replied if message_id provided
        if reply.message_id:
            await db.contacts.update_one(
                {'id': reply.message_id},
                {'$set': {
                    'status': 'replied',
                    'replied_at': datetime.now(timezone.utc),
                    'reply_subject': reply.subject,
                    'reply_preview': reply.body[:200]
                }}
            )

        return {
            'success': True,
            'message': 'Reply sent successfully'
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send reply: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reply")

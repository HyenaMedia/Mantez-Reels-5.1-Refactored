"""
Email Service Abstraction Layer
Supports SMTP, SendGrid, Resend
"""

import html as html_lib
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self, settings: dict[str, Any]):
        self.settings = settings
        self.enabled = settings.get('enabled', False)
        self.provider = settings.get('provider', 'smtp')
        self.from_email = settings.get('fromEmail', 'noreply@example.com')
        self.from_name = settings.get('fromName', 'Portfolio')

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None
    ) -> bool:
        """Send email using configured provider"""
        if not self.enabled:
            logger.warning(f"⚠️  Email service disabled. Would send to {to_email}: {subject}")
            return False

        try:
            if self.provider == 'smtp':
                return await self._send_smtp(to_email, subject, html_content, text_content)
            elif self.provider == 'sendgrid':
                return await self._send_sendgrid(to_email, subject, html_content)
            elif self.provider == 'resend':
                return await self._send_resend(to_email, subject, html_content)
            else:
                logger.error(f"❌ Unknown email provider: {self.provider}")
                return False
        except Exception as e:
            logger.error(f"❌ Email send failed: {e}")
            return False

    async def _send_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None
    ) -> bool:
        """Send email via SMTP"""
        smtp_config = self.settings.get('smtp', {})
        host = smtp_config.get('host', 'localhost')
        port = smtp_config.get('port', 587)
        user = smtp_config.get('user', '')
        password = smtp_config.get('password', '')
        use_tls = smtp_config.get('secure', True)

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{self.from_name} <{self.from_email}>"
        msg['To'] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        try:
            with smtplib.SMTP(host, port) as server:
                if use_tls:
                    server.starttls()
                if user and password:
                    server.login(user, password)
                server.send_message(msg)
            logger.info(f"✅ SMTP email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"❌ SMTP error: {e}")
            return False

    async def _send_sendgrid(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via SendGrid API"""
        api_key = self.settings.get('sendgrid', {}).get('apiKey', '')
        if not api_key:
            logger.error("❌ SendGrid API key not configured")
            return False

        url = "https://api.sendgrid.com/v3/mail/send"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "personalizations": [
                {
                    "to": [{"email": to_email}],
                    "subject": subject
                }
            ],
            "from": {
                "email": self.from_email,
                "name": self.from_name
            },
            "content": [
                {
                    "type": "text/html",
                    "value": html_content
                }
            ]
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers) as response:
                    if response.status == 202:
                        logger.info(f"✅ SendGrid email sent to {to_email}")
                        return True
                    else:
                        error = await response.text()
                        logger.error(f"❌ SendGrid error: {error}")
                        return False
        except Exception as e:
            logger.error(f"❌ SendGrid request failed: {e}")
            return False

    async def _send_resend(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send email via Resend API"""
        api_key = self.settings.get('resend', {}).get('apiKey', '')
        if not api_key:
            logger.error("❌ Resend API key not configured")
            return False

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "from": f"{self.from_name} <{self.from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data, headers=headers) as response:
                    if response.status == 200:
                        logger.info(f"✅ Resend email sent to {to_email}")
                        return True
                    else:
                        error = await response.text()
                        logger.error(f"❌ Resend error: {error}")
                        return False
        except Exception as e:
            logger.error(f"❌ Resend request failed: {e}")
            return False

    async def send_contact_notification(self, name: str, email: str, subject: str, message: str) -> bool:
        """Send notification when someone submits contact form"""
        # Escape all user input to prevent HTML injection in email clients
        safe_name = html_lib.escape(str(name))
        safe_email = html_lib.escape(str(email))
        safe_subject = html_lib.escape(str(subject))
        safe_message = html_lib.escape(str(message)).replace('\n', '<br>')
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #9333ea;">New Contact Form Submission</h2>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Name:</strong> {safe_name}</p>
                    <p><strong>Email:</strong> {safe_email}</p>
                    <p><strong>Subject:</strong> {safe_subject}</p>
                </div>
                <div style="background: white; padding: 20px; border-left: 4px solid #9333ea; margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <p>{safe_message}</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This email was sent from your portfolio website contact form.
                </p>
            </body>
        </html>
        """

        text = f"""New Contact Form Submission
        
Name: {name}
Email: {email}
Subject: {subject}

Message:
{message}
        """

        # Send to admin email from settings
        admin_email = self.settings.get('contactEmail', 'admin@example.com')
        return await self.send_email(
            to_email=admin_email,
            subject=f"New Contact: {subject}",
            html_content=html,
            text_content=text
        )

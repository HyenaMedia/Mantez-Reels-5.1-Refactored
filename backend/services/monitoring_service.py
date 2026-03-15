"""
Monitoring Service Integration
Supports Sentry for error tracking
"""

import logging
import os
import traceback
from typing import Any

logger = logging.getLogger(__name__)


try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    logger.warning("⚠️  Sentry SDK not installed. Run: pip install sentry-sdk")

class MonitoringService:
    def __init__(self, settings: dict[str, Any]):
        self.settings = settings
        self.sentry_enabled = settings.get('sentry', {}).get('enabled', False)

        if self.sentry_enabled and SENTRY_AVAILABLE:
            dsn = settings.get('sentry', {}).get('dsn', '')
            if dsn:
                sentry_sdk.init(
                    dsn=dsn,
                    integrations=[FastApiIntegration()],
                    traces_sample_rate=0.1,  # 10% of transactions
                    profiles_sample_rate=0.1,  # 10% of transactions
                    environment=os.environ.get('ENVIRONMENT', 'production')
                )
                logger.info("✅ Sentry monitoring initialized")
            else:
                logger.warning("⚠️  Sentry enabled but DSN not configured")

    def capture_exception(self, error: Exception, context: dict[str, Any] | None = None):
        """Capture exception and send to monitoring service"""
        if self.sentry_enabled and SENTRY_AVAILABLE:
            if context:
                sentry_sdk.set_context("custom", context)
            sentry_sdk.capture_exception(error)
        else:
            # Fallback to console logging
            logger.error(f"❌ Exception: {error}")
            traceback.print_exc()

    def capture_message(self, message: str, level: str = "info", context: dict[str, Any] | None = None):
        """Capture custom message"""
        if self.sentry_enabled and SENTRY_AVAILABLE:
            if context:
                sentry_sdk.set_context("custom", context)
            sentry_sdk.capture_message(message, level=level)
        else:
            logger.info(f"{level.upper()}: {message}")

    def set_user(self, user_id: str, email: str | None = None, username: str | None = None):
        """Set user context for error tracking"""
        if self.sentry_enabled and SENTRY_AVAILABLE:
            sentry_sdk.set_user({
                "id": user_id,
                "email": email,
                "username": username
            })

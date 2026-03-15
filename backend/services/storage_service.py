"""
Cloud Storage Service Abstraction Layer
Supports S3, DigitalOcean Spaces, Cloudflare R2, Local Storage
"""

import asyncio
import logging
import os
from typing import Any

import aiofiles
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class StorageService:
    def __init__(self, settings: dict[str, Any]):
        self.settings = settings
        self.enabled = settings.get('enabled', False)
        self.provider = settings.get('provider', 'local')

        if self.enabled and self.provider in ['s3', 'spaces', 'r2']:
            s3_config = settings.get('s3', {})
            self.client = boto3.client(
                's3',
                aws_access_key_id=s3_config.get('accessKeyId'),
                aws_secret_access_key=s3_config.get('secretAccessKey'),
                region_name=s3_config.get('region', 'us-east-1'),
                endpoint_url=s3_config.get('endpoint') or None
            )
            self.bucket = s3_config.get('bucket')
        else:
            self.client = None
            self.bucket = None
            self.local_path = os.path.join(os.path.dirname(__file__), '..', 'uploads')
            os.makedirs(self.local_path, exist_ok=True)

    async def upload_file(
        self,
        file_data: bytes,
        filename: str,
        content_type: str,
        folder: str = 'media'
    ) -> tuple[bool, str | None]:
        """Upload file to configured storage"""
        try:
            if not self.enabled or self.provider == 'local':
                return await self._upload_local(file_data, filename, folder)
            else:
                return await self._upload_cloud(file_data, filename, content_type, folder)
        except Exception as e:
            logger.error(f"❌ Upload failed: {e}")
            return False, None

    async def _upload_local(self, file_data: bytes, filename: str, folder: str) -> tuple[bool, str]:
        """Upload to local filesystem"""
        folder_path = os.path.join(self.local_path, folder)
        os.makedirs(folder_path, exist_ok=True)

        file_path = os.path.join(folder_path, filename)

        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_data)

        # Return relative URL path
        url = f"/uploads/{folder}/{filename}"
        logger.info(f"✅ File uploaded locally: {url}")
        return True, url

    async def _upload_cloud(self, file_data: bytes, filename: str, content_type: str, folder: str) -> tuple[bool, str]:
        """Upload to cloud storage (S3/Spaces/R2)"""
        key = f"{folder}/{filename}"

        try:
            # Run boto3 operation in executor to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.put_object(
                    Bucket=self.bucket,
                    Key=key,
                    Body=file_data,
                    ContentType=content_type,
                    ACL='public-read'
                )
            )

            # Generate URL based on provider
            if self.provider == 'spaces':
                region = self.settings.get('s3', {}).get('region', 'nyc3')
                url = f"https://{self.bucket}.{region}.digitaloceanspaces.com/{key}"
            elif self.provider == 'r2':
                # Use publicDomain if set (R2.dev or custom domain), else fall back to storage URL
                public_domain = self.settings.get('s3', {}).get('publicDomain', '').rstrip('/')
                if public_domain:
                    url = f"{public_domain}/{key}"
                else:
                    account_id = self.settings.get('s3', {}).get('accountId', '')
                    url = f"https://{account_id}.r2.cloudflarestorage.com/{self.bucket}/{key}"
            else:  # s3
                region = self.settings.get('s3', {}).get('region', 'us-east-1')
                url = f"https://{self.bucket}.s3.{region}.amazonaws.com/{key}"

            logger.info(f"✅ File uploaded to {self.provider}: {url}")
            return True, url
        except ClientError as e:
            logger.error(f"❌ Cloud upload error: {e}")
            return False, None

    async def download_from_r2(self, key: str) -> tuple[bool, bytes | None]:
        """Download a file from R2 by its storage key (e.g. 'media/filename.webp')"""
        if not self.client:
            return False, None
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.get_object(Bucket=self.bucket, Key=key)
            )
            data = response['Body'].read()
            return True, data
        except ClientError as e:
            logger.error(f"❌ R2 download error for key '{key}': {e}")
            return False, None

    async def delete_from_r2(self, key: str) -> bool:
        """Delete a file from R2 by its storage key"""
        if not self.client:
            return False
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.delete_object(Bucket=self.bucket, Key=key)
            )
            logger.info(f"✅ R2 file deleted: {key}")
            return True
        except ClientError as e:
            logger.error(f"❌ R2 delete error for key '{key}': {e}")
            return False

    async def delete_file(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            if not self.enabled or self.provider == 'local':
                return await self._delete_local(file_path)
            else:
                return await self._delete_cloud(file_path)
        except Exception as e:
            logger.error(f"❌ Delete failed: {e}")
            return False

    async def _delete_local(self, file_path: str) -> bool:
        """Delete from local filesystem"""
        # Remove /uploads/ prefix if present
        if file_path.startswith('/uploads/'):
            file_path = file_path[9:]

        full_path = os.path.normpath(os.path.join(self.local_path, file_path))

        # Prevent path traversal — ensure resolved path is within local_path
        if not full_path.startswith(os.path.normpath(self.local_path)):
            logger.warning(f"⚠️ Path traversal attempt blocked: {file_path}")
            return False

        if os.path.exists(full_path):
            os.remove(full_path)
            logger.info(f"✅ File deleted locally: {file_path}")
            return True
        return False

    async def _delete_cloud(self, file_path: str) -> bool:
        """Delete from cloud storage"""
        # Extract key from URL
        key = file_path.split('/')[-2] + '/' + file_path.split('/')[-1]

        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.client.delete_object(Bucket=self.bucket, Key=key)
            )
            logger.info(f"✅ File deleted from {self.provider}: {key}")
            return True
        except ClientError as e:
            logger.error(f"❌ Cloud delete error: {e}")
            return False

    def get_upload_url(self, filename: str, folder: str = 'media') -> str:
        """Get the URL where file will be accessible after upload"""
        if not self.enabled or self.provider == 'local':
            return f"/uploads/{folder}/{filename}"

        key = f"{folder}/{filename}"

        if self.provider == 'spaces':
            region = self.settings.get('s3', {}).get('region', 'nyc3')
            return f"https://{self.bucket}.{region}.digitaloceanspaces.com/{key}"
        elif self.provider == 'r2':
            account_id = self.settings.get('s3', {}).get('accountId', '')
            return f"https://{account_id}.r2.cloudflarestorage.com/{self.bucket}/{key}"
        else:  # s3
            region = self.settings.get('s3', {}).get('region', 'us-east-1')
            return f"https://{self.bucket}.s3.{region}.amazonaws.com/{key}"

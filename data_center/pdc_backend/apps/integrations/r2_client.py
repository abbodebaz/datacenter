"""
Cloudflare R2 Storage Client (S3-compatible).
"""
import boto3
from botocore.config import Config
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version='s3v4'),
        region_name='auto',
    )


def generate_presigned_url(r2_key: str, content_type: str = 'image/jpeg', expires_in: int = 3600) -> str:
    """Generate a presigned PUT URL for direct client upload."""
    client = get_r2_client()
    url = client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': settings.R2_BUCKET_NAME,
            'Key': r2_key,
            'ContentType': content_type,
        },
        ExpiresIn=expires_in,
    )
    return url


def upload_bytes(r2_key: str, data: bytes, content_type: str = 'image/jpeg') -> str:
    """Upload bytes directly to R2. Returns the public URL."""
    client = get_r2_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=r2_key,
        Body=data,
        ContentType=content_type,
    )
    return f'{settings.R2_PUBLIC_URL}/{r2_key}'


def delete_object(r2_key: str):
    """Delete an object from R2."""
    client = get_r2_client()
    client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)



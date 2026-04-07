from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

class R2Storage(S3Boto3Storage):
    access_key = settings.R2_ACCESS_KEY_ID
    secret_key = settings.R2_SECRET_ACCESS_KEY
    bucket_name = settings.R2_BUCKET_NAME
    endpoint_url = settings.R2_ENDPOINT_URL
    region_name = 'auto'
    signature_version = 's3v4'

    def url(self, name, parameters=None, expire=None, **kwargs):
        if settings.R2_PUBLIC_URL:
            return f'{settings.R2_PUBLIC_URL}/{name}'
        return super().url(name, parameters, expire, **kwargs)

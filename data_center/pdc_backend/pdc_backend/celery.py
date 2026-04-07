"""
Celery configuration for pdc_backend project.
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pdc_backend.settings.base')

app = Celery('pdc_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

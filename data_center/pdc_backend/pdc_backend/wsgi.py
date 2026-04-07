"""
WSGI config for pdc_backend project.
"""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pdc_backend.settings.development')

application = get_wsgi_application()

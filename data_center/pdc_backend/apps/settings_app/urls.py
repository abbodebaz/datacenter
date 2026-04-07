from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.settings_app.views import LookupValueViewSet

router = DefaultRouter()
router.register('lookups', LookupValueViewSet, basename='lookup')

urlpatterns = [
    path('', include(router.urls)),
]

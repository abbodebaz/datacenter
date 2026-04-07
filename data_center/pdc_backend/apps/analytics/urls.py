from rest_framework.routers import DefaultRouter
from .views import CompletenessReportViewSet

router = DefaultRouter()
router.register(r'completeness', CompletenessReportViewSet, basename='completeness-report')

urlpatterns = router.urls

from rest_framework.routers import DefaultRouter
from .views import ApprovalRequestViewSet

router = DefaultRouter()
router.register(r'', ApprovalRequestViewSet, basename='approval-request')

urlpatterns = router.urls

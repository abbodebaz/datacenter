from django.urls import path
from apps.users.views import LoginView, MeView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
]

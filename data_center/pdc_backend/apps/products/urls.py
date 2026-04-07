"""
URL router for products app.
Uses separate routers so prefixes never conflict with product {pk}/.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views import ProductViewSet, BrandViewSet, ProductSubmissionViewSet

products_router = DefaultRouter()
products_router.register('', ProductViewSet, basename='product')

brands_router = DefaultRouter()
brands_router.register('', BrandViewSet, basename='brand')

submissions_router = DefaultRouter()
submissions_router.register('', ProductSubmissionViewSet, basename='submission')

urlpatterns = [
    path('brands/',       include(brands_router.urls)),
    path('submissions/',  include(submissions_router.urls)),
    path('',              include(products_router.urls)),
]

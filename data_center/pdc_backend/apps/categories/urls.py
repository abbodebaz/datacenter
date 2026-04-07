from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.categories.views import CategoryViewSet, CategoryAttributeSchemaViewSet, SubCategoryViewSet

router = DefaultRouter()
router.register('schemas', CategoryAttributeSchemaViewSet, basename='attribute-schema')
router.register('subcategories', SubCategoryViewSet, basename='subcategory')
router.register('', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]

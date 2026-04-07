"""Logs views."""
from rest_framework import viewsets, permissions
from apps.logs.models import AuditLog
from apps.logs.serializers import AuditLogSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['action', 'content_type', 'object_id']
    search_fields = ['action', 'details', 'object_repr']

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset

        # فلتر مباشر على object_id (للوج المنتج)
        object_id = self.request.query_params.get('object_id')
        content_type = self.request.query_params.get('content_type')
        if object_id and content_type:
            return qs.filter(object_id=object_id, content_type=content_type)

        if user.role != 'super_admin':
            return qs.filter(user=user)
        return qs

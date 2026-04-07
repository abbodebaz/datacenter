"""
Settings app views — lookup value CRUD.
Read: all authenticated users.
Write: super_admin only.
"""
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from apps.settings_app.models import LookupValue
from apps.settings_app.serializers import LookupValueSerializer


class LookupValueViewSet(viewsets.ModelViewSet):
    serializer_class = LookupValueSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = LookupValue.objects.all()
        lookup_type = self.request.query_params.get('type')
        if lookup_type:
            qs = qs.filter(lookup_type=lookup_type)
        return qs

    def _check_admin(self):
        if not self.request.user.is_authenticated or self.request.user.role != 'super_admin':
            raise PermissionDenied('هذه العملية للمديرين العامين فقط.')

    def create(self, request, *args, **kwargs):
        self._check_admin()
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self._check_admin()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._check_admin()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_admin()
        return super().destroy(request, *args, **kwargs)

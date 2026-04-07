"""Logs serializers."""
from rest_framework import serializers
from apps.logs.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    action_display = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = '__all__'

    def get_user_name(self, obj):
        return obj.user.name_ar if obj.user else '—'

    def get_action_display(self, obj):
        return obj.get_action_display()

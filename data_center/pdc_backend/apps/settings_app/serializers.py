from rest_framework import serializers
from apps.settings_app.models import LookupValue


class LookupValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = LookupValue
        fields = ['id', 'lookup_type', 'name_ar', 'name_en', 'is_active', 'order']

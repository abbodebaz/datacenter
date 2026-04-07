"""Analytics serializers."""
from rest_framework import serializers
from apps.analytics.models import CompletenessReport


class CompletenessReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletenessReport
        fields = '__all__'

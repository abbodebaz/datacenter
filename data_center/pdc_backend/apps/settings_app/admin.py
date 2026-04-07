from django.contrib import admin
from apps.settings_app.models import LookupValue


@admin.register(LookupValue)
class LookupValueAdmin(admin.ModelAdmin):
    list_display = ['lookup_type', 'name_ar', 'name_en', 'is_active', 'order']
    list_filter = ['lookup_type', 'is_active']
    search_fields = ['name_ar', 'name_en']

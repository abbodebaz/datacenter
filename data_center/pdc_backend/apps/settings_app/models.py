"""
Settings app — configurable lookup lists (countries, colors, etc.)
"""
from django.db import models


class LookupValue(models.Model):
    LOOKUP_TYPES = [
        ('country', 'بلد المنشأ'),
        ('color', 'اللون'),
    ]

    lookup_type = models.CharField(max_length=50, choices=LOOKUP_TYPES, verbose_name='نوع القائمة')
    name_ar = models.CharField(max_length=100, verbose_name='الاسم بالعربية')
    name_en = models.CharField(max_length=100, blank=True, verbose_name='الاسم بالإنجليزية')
    is_active = models.BooleanField(default=True, verbose_name='مفعّل')
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')

    class Meta:
        verbose_name = 'قيمة إعداد'
        verbose_name_plural = 'قيم الإعدادات'
        ordering = ['lookup_type', 'order', 'name_ar']
        unique_together = [['lookup_type', 'name_ar']]

    def __str__(self):
        return f'[{self.lookup_type}] {self.name_ar}'

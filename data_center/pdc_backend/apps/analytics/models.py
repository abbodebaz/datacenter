"""
Analytics models — completeness reports, dashboard data.
"""
from django.db import models


class CompletenessReport(models.Model):
    """Snapshot of data completeness, generated daily by Celery."""
    overall_score = models.FloatField(default=0, verbose_name='نسبة الاكتمال الإجمالية %')
    total_products = models.IntegerField(default=0, verbose_name='إجمالي المنتجات')
    complete_products = models.IntegerField(default=0, verbose_name='المنتجات المكتملة')
    # Per-category scores: {"سيراميك": 75, "رخام": 60, ...}
    category_scores = models.JSONField(default=dict, verbose_name='نسب الاكتمال بالفئة')
    critical_gaps = models.JSONField(default=list, verbose_name='الفجوات الحرجة')
    recommendations = models.JSONField(default=list, verbose_name='التوصيات')
    missing_lifestyle_images = models.IntegerField(default=0, verbose_name='صور ديكورية ناقصة')
    missing_main_images = models.IntegerField(default=0, verbose_name='صور رئيسية ناقصة')
    missing_sap_data = models.IntegerField(default=0, verbose_name='بيانات SAP ناقصة')
    generated_at = models.DateTimeField(auto_now_add=True, verbose_name='تاريخ التقرير')

    class Meta:
        verbose_name = 'تقرير الاكتمال'
        verbose_name_plural = 'تقارير الاكتمال'
        ordering = ['-generated_at']

    def __str__(self):
        return f'تقرير الاكتمال — {self.generated_at.strftime("%Y-%m-%d")} ({self.overall_score:.1f}%)'

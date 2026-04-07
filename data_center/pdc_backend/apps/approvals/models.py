"""
Approvals models — product approval workflow.
"""
from django.db import models


class ProductApprovalRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('ai_reviewed', 'مراجعة AI'),
        ('human_reviewing', 'مراجعة بشرية'),
        ('approved', 'مُعتمد'),
        ('rejected', 'مرفوض'),
    ]

    REQUEST_TYPE_CHOICES = [
        ('new_product', 'منتج جديد'),
        ('edit_product', 'تعديل منتج'),
    ]

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='approval_requests',
        verbose_name='المنتج'
    )
    submitted_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='submitted_approvals',
        verbose_name='قدّمه'
    )
    request_type = models.CharField(
        max_length=20,
        choices=REQUEST_TYPE_CHOICES,
        default='new_product',
        verbose_name='نوع الطلب',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_data = models.JSONField(default=dict, verbose_name='البيانات المُقدَّمة')
    previous_status = models.CharField(max_length=50, blank=True, verbose_name='الحالة السابقة للمنتج')

    # AI validation result
    ai_validation_result = models.JSONField(null=True, blank=True, verbose_name='نتيجة مراجعة AI')
    ai_score = models.IntegerField(null=True, blank=True, verbose_name='درجة AI')
    ai_auto_approve_eligible = models.BooleanField(default=False)

    # Human reviewer
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_approvals',
        verbose_name='راجعه'
    )
    reviewer_notes = models.TextField(blank=True, verbose_name='ملاحظات المراجع')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'طلب اعتماد منتج'
        verbose_name_plural = 'طلبات اعتماد المنتجات'
        ordering = ['-created_at']

    def __str__(self):
        return f'طلب اعتماد: {self.product.sku} — {self.get_status_display()}'

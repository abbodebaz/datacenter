"""
Audit log models — all operations are logged.
"""
from django.db import models


class AuditLog(models.Model):
    ACTION_TYPES = [
        ('create_product', 'إنشاء منتج'),
        ('update_product', 'تعديل منتج'),
        ('publish_product', 'نشر منتج'),
        ('delete_product', 'حذف منتج'),
        ('upload_image', 'رفع صورة'),
        ('approve_image', 'اعتماد صورة'),
        ('reject_image', 'رفض صورة'),
        ('generate_description', 'توليد وصف AI'),
        ('generate_image', 'توليد صورة AI'),
        ('sap_sync', 'مزامنة SAP'),
        ('generate_catalog', 'توليد كتالوج PDF'),
        ('user_login', 'تسجيل دخول'),
        ('create_user', 'إنشاء مستخدم'),
        ('update_user', 'تعديل مستخدم'),
        ('approval_submit', 'طلب اعتماد'),
        ('approval_approve', 'موافقة على منتج'),
        ('approval_reject', 'رفض منتج'),
    ]

    user = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
        verbose_name='المستخدم'
    )
    action = models.CharField(max_length=30, choices=ACTION_TYPES, verbose_name='الإجراء')
    content_type = models.CharField(max_length=50, blank=True, verbose_name='نوع الكائن')
    object_id = models.PositiveIntegerField(null=True, blank=True, verbose_name='معرف الكائن')
    object_repr = models.CharField(max_length=200, blank=True, verbose_name='وصف الكائن')
    details = models.TextField(blank=True, verbose_name='التفاصيل')
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name='عنوان IP')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='الوقت')

    class Meta:
        verbose_name = 'سجل عملية'
        verbose_name_plural = 'سجل العمليات'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action', '-created_at']),
        ]

    def __str__(self):
        return f'{self.user} — {self.get_action_display()} — {self.created_at.strftime("%Y-%m-%d %H:%M")}'

"""
ProductImage model for Bayt Alebaa PDC.
Handles all image types per product with R2 storage.
"""
from django.db import models


class ImageType(models.TextChoices):
    MAIN = 'main', 'الصورة الرئيسية'
    GALLERY = 'gallery', 'معرض الصور'
    DETAIL = 'detail', 'صورة التفاصيل'
    LIFESTYLE = 'lifestyle', 'صورة ديكورية'
    TECHNICAL = 'technical', 'مخطط تقني'


class ImageStatus(models.TextChoices):
    PENDING_REVIEW = 'pending_review', 'قيد المراجعة'
    APPROVED = 'approved', 'مُعتمدة'
    REJECTED = 'rejected', 'مرفوضة'


class ProductImage(models.Model):
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='المنتج'
    )
    image_type = models.CharField(
        max_length=15,
        choices=ImageType.choices,
        default=ImageType.GALLERY,
        verbose_name='نوع الصورة'
    )
    # R2 storage key: products/{category_slug}/{sku}/gallery/01.jpg
    r2_key = models.CharField(max_length=300, verbose_name='مسار R2')
    r2_url = models.URLField(blank=True, verbose_name='رابط الصورة')
    original_filename = models.CharField(max_length=200, blank=True, verbose_name='اسم الملف الأصلي')
    width = models.PositiveIntegerField(null=True, blank=True, verbose_name='العرض (بكسل)')
    height = models.PositiveIntegerField(null=True, blank=True, verbose_name='الارتفاع (بكسل)')
    file_size_kb = models.PositiveIntegerField(null=True, blank=True, verbose_name='حجم الملف (كيلوبايت)')
    status = models.CharField(
        max_length=15,
        choices=ImageStatus.choices,
        default=ImageStatus.PENDING_REVIEW,
        verbose_name='الحالة'
    )
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')

    # AI generation tracking
    is_ai_generated = models.BooleanField(default=False, verbose_name='مُولَّدة بالـ AI')
    ai_prompt_used = models.TextField(blank=True, verbose_name='البرومبت المُستخدم')
    ai_generation_task_id = models.CharField(max_length=100, blank=True, verbose_name='معرف مهمة Celery')

    # Background removal
    has_bg_removed = models.BooleanField(default=False, verbose_name='تم إزالة الخلفية')

    # Reviewer info
    reviewed_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reviewed_images',
        verbose_name='المُراجِع'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_notes = models.TextField(blank=True, verbose_name='ملاحظات المراجع')

    uploaded_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='uploaded_images',
        verbose_name='رُفعت بواسطة'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'صورة منتج'
        verbose_name_plural = 'صور المنتجات'
        ordering = ['product', 'image_type', 'order']

    def __str__(self):
        return f'{self.product.sku} — {self.get_image_type_display()} #{self.order}'

    def get_display_url(self):
        from django.conf import settings
        return f'{settings.R2_PUBLIC_URL}/{self.r2_key}' if self.r2_key else self.r2_url


class DecorativeGenerationStatus(models.TextChoices):
    ANALYZING = 'analyzing', 'جاري التحليل'
    ANALYZED = 'analyzed', 'تم التحليل'
    GENERATING = 'generating', 'جاري التوليد'
    COMPLETED = 'completed', 'مكتمل'
    FAILED = 'failed', 'فشل'


class DecorativeGeneration(models.Model):
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='decorative_generations',
        verbose_name='المنتج',
        null=True, blank=True,
    )
    source_image_url = models.URLField(verbose_name='رابط الصورة المصدر')
    status = models.CharField(
        max_length=15,
        choices=DecorativeGenerationStatus.choices,
        default=DecorativeGenerationStatus.ANALYZING,
        verbose_name='الحالة',
    )

    vision_analysis = models.JSONField(
        default=dict, blank=True,
        verbose_name='نتيجة تحليل الرؤية',
    )

    generation_settings = models.JSONField(
        default=dict, blank=True,
        verbose_name='إعدادات التوليد',
    )
    prompt_used = models.TextField(blank=True, verbose_name='البرومبت المُستخدم')
    negative_prompt = models.TextField(blank=True, verbose_name='البرومبت السلبي')

    kie_task_id = models.CharField(max_length=100, blank=True, verbose_name='معرف مهمة Kie.ai')
    result_image_url = models.URLField(blank=True, verbose_name='رابط الصورة الناتجة')

    error_message = models.TextField(blank=True, verbose_name='رسالة الخطأ')

    is_multi_product = models.BooleanField(default=False, verbose_name='مشهد متعدد المنتجات')
    multi_product_data = models.JSONField(
        default=list, blank=True,
        verbose_name='بيانات المنتجات المتعددة',
        help_text='List of {role, image_url, product_id, analysis} for multi-product scenes',
    )

    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='decorative_generations',
        verbose_name='أُنشئ بواسطة',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'توليد صورة ديكورية'
        verbose_name_plural = 'توليد صور ديكورية'
        ordering = ['-created_at']

    def __str__(self):
        product_label = self.product.sku if self.product else 'بدون منتج'
        return f'توليد ديكوري — {product_label} ({self.get_status_display()})'

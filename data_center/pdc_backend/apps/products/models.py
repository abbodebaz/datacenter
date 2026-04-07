"""
Product model for Bayt Alebaa PDC.
Core product entity with JSONB dynamic attributes per category.
"""
from django.db import models
from django.core.validators import MinValueValidator


class ProductStatus(models.TextChoices):
    ACTIVE = 'نشط', 'نشط'
    DRAFT = 'مسودة', 'مسودة'
    UNDER_REVIEW = 'قيد_المراجعة', 'قيد المراجعة'
    INACTIVE = 'موقوف', 'موقوف'
    DISCONTINUED = 'منتهي', 'منتهي'


class InventoryType(models.TextChoices):
    PERIODIC = 'دوري', 'دوري'
    STOCK = 'ستوك', 'ستوك'
    DISCONTINUED = 'منتهي', 'منتهي'


class Product(models.Model):
    # ── Identity ──────────────────────────────────────────────
    sku = models.CharField(max_length=50, unique=True, verbose_name='الرقم التعريفي (SKU)')
    product_name_ar = models.CharField(max_length=200, verbose_name='اسم المنتج بالعربية')
    product_name_en = models.CharField(max_length=200, blank=True, verbose_name='Product Name in English')
    description_ar = models.TextField(blank=True, verbose_name='الوصف بالعربية')
    description_en = models.TextField(blank=True, verbose_name='Description in English')

    # ── Classification ────────────────────────────────────────
    category = models.ForeignKey(
        'categories.Category',
        on_delete=models.PROTECT,
        related_name='products',
        verbose_name='الفئة'
    )
    subcategory = models.ForeignKey(
        'categories.SubCategory',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='products',
        verbose_name='الفئة الفرعية'
    )
    brand = models.ForeignKey(
        'Brand',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='products',
        verbose_name='العلامة التجارية'
    )
    origin_country = models.CharField(max_length=100, blank=True, verbose_name='بلد المنشأ')

    # ── Status & Inventory ────────────────────────────────────
    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.DRAFT,
        verbose_name='الحالة'
    )
    inventory_type = models.CharField(
        max_length=10,
        choices=InventoryType.choices,
        default=InventoryType.PERIODIC,
        verbose_name='نوع المخزون'
    )
    color = models.CharField(max_length=100, blank=True, verbose_name='اللون')

    # ── SAP Data (synced every 30 min) ────────────────────────
    price_sar = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        validators=[MinValueValidator(0)],
        verbose_name='السعر (ريال)'
    )
    stock_status = models.CharField(max_length=50, blank=True, verbose_name='حالة المخزون (SAP)')
    sap_last_sync = models.DateTimeField(null=True, blank=True, verbose_name='آخر مزامنة SAP')

    # ── E-commerce ────────────────────────────────────────────
    ecommerce_url = models.URLField(blank=True, verbose_name='رابط المتجر الإلكتروني')

    # ── Dynamic Attributes (JSONB per category) ───────────────
    # Example for ceramics: {"المقاس": "60×60", "PEI": "4", "معدل الامتصاص": "0.5%", ...}
    attributes = models.JSONField(default=dict, blank=True, verbose_name='السمات الديناميكية')

    # ── Metadata ──────────────────────────────────────────────
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_products',
        verbose_name='أنشأه'
    )
    updated_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='updated_products',
        verbose_name='آخر تعديل بواسطة'
    )
    published_at = models.DateTimeField(null=True, blank=True, verbose_name='تاريخ النشر')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'منتج'
        verbose_name_plural = 'المنتجات'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sku']),
            models.Index(fields=['status']),
            models.Index(fields=['inventory_type']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['brand']),
            models.Index(fields=['origin_country']),
            models.Index(fields=['color']),
            models.Index(fields=['price_sar']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.sku} — {self.product_name_ar}'

    @property
    def main_image(self):
        return self.images.filter(image_type='main', status='approved').first()

    @property
    def lifestyle_image(self):
        return self.images.filter(image_type='lifestyle', status='approved').first()

    def completeness_score(self):
        """Calculate data completeness percentage using prefetch cache (no extra queries)."""
        required_fields = [
            'sku', 'product_name_ar', 'product_name_en', 'category_id',
            'description_ar', 'status', 'brand_id', 'origin_country',
            'inventory_type', 'color', 'ecommerce_url', 'price_sar', 'stock_status',
        ]
        filled = sum(1 for f in required_fields if getattr(self, f, None))

        cached_images = self.images.all()
        has_main = any(img.image_type == 'main' and img.status == 'approved' for img in cached_images)
        has_lifestyle = any(img.image_type == 'lifestyle' and img.status == 'approved' for img in cached_images)
        if has_main:
            filled += 1
        if has_lifestyle:
            filled += 1

        total = len(required_fields) + 2
        return round((filled / total) * 100)


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name='العلامة التجارية')
    name_ar = models.CharField(max_length=100, blank=True, verbose_name='الاسم بالعربية')
    origin_country = models.CharField(max_length=100, blank=True)
    logo_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'علامة تجارية'
        verbose_name_plural = 'العلامات التجارية'
        ordering = ['name']

    def __str__(self):
        return self.name_ar or self.name


class SubmissionStatus(models.TextChoices):
    PENDING          = 'pending',           'في الانتظار'
    IN_REVIEW        = 'in_review',         'قيد المراجعة'
    PENDING_APPROVAL = 'pending_approval',  'تحت الموافقة'
    APPROVED         = 'approved',          'معتمد'
    REJECTED         = 'rejected',          'مرفوض'


class ProductSubmission(models.Model):
    """
    A visitor-submitted request to add a new product.
    Flow: pending → in_review → pending_approval → approved / rejected
    """
    sku              = models.CharField(max_length=50, blank=True, verbose_name='SKU')
    category         = models.ForeignKey(
        'categories.Category', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='submissions', verbose_name='التصنيف',
    )
    product_name_ar  = models.CharField(max_length=200, verbose_name='اسم المنتج')
    submitter_name   = models.CharField(max_length=100, verbose_name='اسم مقدّم الطلب')
    submitter_email  = models.EmailField(verbose_name='البريد الإلكتروني')
    status           = models.CharField(
        max_length=30, choices=SubmissionStatus.choices,
        default=SubmissionStatus.PENDING, verbose_name='الحالة',
    )
    assigned_manager = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_submissions', verbose_name='المدير المسؤول',
    )
    manager_notes    = models.TextField(blank=True, verbose_name='ملاحظات المدير')
    admin_notes      = models.TextField(blank=True, verbose_name='ملاحظات المدير العام')
    # حقول إضافية يكملها المدير قبل الاعتماد
    extra_data       = models.JSONField(default=dict, blank=True, verbose_name='بيانات إضافية للمنتج')
    product          = models.OneToOneField(
        'products.Product', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='submission_request', verbose_name='المنتج المُنشأ',
    )
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'طلب إضافة منتج'
        verbose_name_plural = 'طلبات إضافة منتجات'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.product_name_ar} — {self.get_status_display()}'


class SubmissionImage(models.Model):
    submission  = models.ForeignKey(ProductSubmission, on_delete=models.CASCADE, related_name='images')
    r2_key      = models.CharField(max_length=500)
    r2_url      = models.URLField(max_length=1000)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Image for {self.submission}'

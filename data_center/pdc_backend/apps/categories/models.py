"""
Category models for Bayt Alebaa PDC.
Self-referencing hierarchy up to 5 levels with dynamic attribute schemas.
"""
from django.db import models
from django.core.exceptions import ValidationError


class Category(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='كود التصنيف')
    name_ar = models.CharField(max_length=255, verbose_name='الاسم بالعربية')
    name_en = models.CharField(max_length=255, blank=True, verbose_name='Name in English')
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='children',
        verbose_name='التصنيف الأب',
    )
    level = models.PositiveIntegerField(default=1, verbose_name='المستوى')
    sort_order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')
    is_active = models.BooleanField(default=True)
    # Legacy fields kept for backward compatibility
    slug = models.SlugField(max_length=100, unique=True, null=True, blank=True)
    description_ar = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'تصنيف'
        verbose_name_plural = 'التصنيفات'
        ordering = ['sort_order', 'order', 'name_ar']

    def clean(self):
        if self.level > 5:
            raise ValidationError('الحد الأقصى لمستويات التصنيف هو 5.')

    def save(self, *args, **kwargs):
        if self.parent_id:
            self.level = self.parent.level + 1
        else:
            self.level = 1
        if self.level > 5:
            raise ValidationError('الحد الأقصى لمستويات التصنيف هو 5.')
        super().save(*args, **kwargs)

    def get_ancestors(self):
        """Returns list of ancestors from root to self (inclusive)."""
        ancestors = []
        node = self
        while node:
            ancestors.append(node)
            node = node.parent
        return list(reversed(ancestors))

    def get_path_string(self, lang='ar'):
        name_field = 'name_en' if lang == 'en' else 'name_ar'
        return ' > '.join(getattr(a, name_field) or a.name_ar for a in self.get_ancestors())

    def __str__(self):
        return f'{"— " * (self.level - 1)}{self.name_ar}'


class SubCategory(models.Model):
    """Legacy model — kept for migration safety. Will be removed after data migration."""
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    name_ar = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100, blank=True)
    slug = models.SlugField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'فئة فرعية (قديم)'
        verbose_name_plural = 'الفئات الفرعية (قديم)'
        unique_together = ['category', 'slug']

    def __str__(self):
        return f'{self.category.name_ar} — {self.name_ar}'


class CategoryAttributeSchema(models.Model):
    FIELD_TYPES = [
        ('text', 'نص حر'),
        ('number', 'رقم'),
        ('select', 'قائمة اختيار'),
        ('multi_select', 'اختيار متعدد'),
        ('boolean', 'نعم/لا'),
        ('dimensions', 'أبعاد'),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='attribute_schemas')
    field_key = models.CharField(max_length=50, verbose_name='مفتاح الحقل')
    field_label_ar = models.CharField(max_length=100, verbose_name='اسم الحقل بالعربية')
    field_label_en = models.CharField(max_length=100, blank=True, verbose_name='Field Name in English')
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES, default='text')
    options = models.JSONField(default=list, blank=True, verbose_name='خيارات القائمة (عربي)')
    options_en = models.JSONField(default=list, blank=True, verbose_name='List Options (English)')
    is_required = models.BooleanField(default=False, verbose_name='مطلوب')
    unit = models.CharField(max_length=20, blank=True, verbose_name='الوحدة بالعربية')
    unit_en = models.CharField(max_length=20, blank=True, verbose_name='Unit in English')
    order = models.PositiveIntegerField(default=0, verbose_name='الترتيب')
    help_text_ar = models.CharField(max_length=200, blank=True, verbose_name='نص مساعد')

    class Meta:
        verbose_name = 'حقل ديناميكي للفئة'
        verbose_name_plural = 'الحقول الديناميكية للفئات'
        ordering = ['category', 'order']
        unique_together = ['category', 'field_key']

    def __str__(self):
        return f'{self.category.name_ar} — {self.field_label_ar}'

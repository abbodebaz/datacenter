"""
Categories serializers — hierarchical self-referencing model.
"""
import re
from rest_framework import serializers
from apps.categories.models import Category, SubCategory, CategoryAttributeSchema


# ─────────────────────────────────────────────────────────────────
# Attribute Schema
# ─────────────────────────────────────────────────────────────────
class CategoryAttributeSchemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoryAttributeSchema
        fields = [
            'id', 'category', 'field_key', 'field_label_ar', 'field_label_en',
            'field_type', 'options', 'options_en', 'is_required',
            'unit', 'unit_en', 'help_text_ar', 'order',
        ]
        extra_kwargs = {'category': {'read_only': True}}


# ─────────────────────────────────────────────────────────────────
# Legacy SubCategory (kept for backward compat)
# ─────────────────────────────────────────────────────────────────
class SubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ['id', 'name_ar', 'name_en', 'slug', 'is_active']


class SubCategoryWriteSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = SubCategory
        fields = ['name_ar', 'name_en', 'slug', 'is_active']

    def _make_slug(self, name_en, name_ar, category, exclude_pk=None):
        base = re.sub(r'[^a-z0-9]+', '-', name_en.lower()).strip('-') if name_en else ''
        if not base:
            base = re.sub(r'[^\w]+', '-', name_ar).strip('-') or 'sub'
        slug = base
        counter = 1
        qs = SubCategory.objects.filter(category=category)
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        while qs.filter(slug=slug).exists():
            slug = f"{base}-{counter}"
            counter += 1
        return slug

    def validate(self, attrs):
        category = self.context.get('category')
        if not attrs.get('slug'):
            attrs['slug'] = self._make_slug(
                attrs.get('name_en', ''),
                attrs.get('name_ar', ''),
                category,
                exclude_pk=self.instance.pk if self.instance else None,
            )
        return attrs


# ─────────────────────────────────────────────────────────────────
# Category — Tree (recursive, used for admin tree view)
# ─────────────────────────────────────────────────────────────────
class CategoryTreeSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    attribute_count = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'code', 'name_ar', 'name_en', 'level', 'sort_order',
            'is_active', 'icon', 'description_ar',
            'attribute_count', 'children_count', 'children',
        ]

    def get_children(self, obj):
        children = obj.children.all().order_by('sort_order', 'name_ar')
        return CategoryTreeSerializer(children, many=True, context=self.context).data

    def get_attribute_count(self, obj):
        # Attributes live on the root ancestor only; walk up and count from there
        root = obj
        while root.parent_id is not None:
            root = root.parent
        return root.attribute_schemas.count()

    def get_children_count(self, obj):
        return obj.children.count()


# ─────────────────────────────────────────────────────────────────
# Category — Flat (breadcrumb path, used for dropdowns)
# ─────────────────────────────────────────────────────────────────
class CategoryFlatSerializer(serializers.ModelSerializer):
    path_ar = serializers.SerializerMethodField()
    path_en = serializers.SerializerMethodField()
    has_children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'code', 'name_ar', 'name_en', 'level',
            'parent', 'sort_order', 'is_active',
            'path_ar', 'path_en', 'has_children',
        ]

    def get_path_ar(self, obj):
        return obj.get_path_string('ar')

    def get_path_en(self, obj):
        return obj.get_path_string('en')

    def get_has_children(self, obj):
        return obj.children.exists()


# ─────────────────────────────────────────────────────────────────
# Category — Write
# ─────────────────────────────────────────────────────────────────
class CategoryWriteSerializer(serializers.ModelSerializer):
    code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = [
            'code', 'name_ar', 'name_en', 'parent',
            'sort_order', 'is_active', 'icon', 'description_ar',
        ]

    def _make_code(self, name_en, name_ar, parent, exclude_pk=None):
        base = re.sub(r'[^A-Z0-9]+', '-', name_en.upper()).strip('-') if name_en else ''
        if not base:
            base = re.sub(r'[^\w]+', '-', name_ar).strip('-') or 'CAT'
        if parent:
            base = f'{parent.code}-{base}'[:50]
        base = base[:50]
        code = base
        counter = 1
        qs = Category.objects.all()
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        while qs.filter(code=code).exists():
            code = f'{base[:46]}-{counter}'
            counter += 1
        return code

    def validate(self, attrs):
        if not attrs.get('code'):
            parent = attrs.get('parent')
            attrs['code'] = self._make_code(
                attrs.get('name_en', ''),
                attrs.get('name_ar', ''),
                parent,
                exclude_pk=self.instance.pk if self.instance else None,
            )
        return attrs

    def validate_parent(self, value):
        if value and value.level >= 5:
            raise serializers.ValidationError('الحد الأقصى لعمق التصنيف هو 5 مستويات.')
        return value


# ─────────────────────────────────────────────────────────────────
# Legacy CategorySerializer (kept for backward compat)
# ─────────────────────────────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    attribute_count = serializers.SerializerMethodField()
    subcategory_count = serializers.SerializerMethodField()
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'code', 'name_ar', 'name_en', 'slug', 'description_ar',
            'icon', 'is_active', 'order', 'level', 'parent', 'sort_order',
            'subcategories', 'attribute_count', 'subcategory_count', 'children_count',
        ]

    def get_attribute_count(self, obj):
        root = obj
        while root.parent_id is not None:
            root = root.parent
        return root.attribute_schemas.count()

    def get_subcategory_count(self, obj):
        return obj.subcategories.count()

    def get_children_count(self, obj):
        return obj.children.count()

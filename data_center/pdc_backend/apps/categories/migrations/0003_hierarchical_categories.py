"""
Migration: Convert Category to self-referencing hierarchy (up to 5 levels).
Steps:
  1. Make slug nullable
  2. Add new fields (code nullable, parent, level, sort_order, updated_at)
  3. Data migration: assign codes + convert SubCategories → child Categories
  4. Make code non-nullable + add unique constraint
"""
from django.db import migrations, models
import django.db.models.deletion


def assign_codes_and_create_children(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    SubCategory = apps.get_model('categories', 'SubCategory')

    # Map existing slug → code for the 6 main categories
    SLUG_TO_CODE = {
        'ceramics-tiles':       'CERAMICS',
        'marble':               'MARBLE',
        'sanitreyware':         'SANITARY',
        'kitchens':             'KITCHENS',
        'd-cor':                'DECOR',
        'supporting-materials': 'SUPPORT',
    }

    # Assign codes to existing root categories
    for cat in Category.objects.filter(parent=None).order_by('order'):
        slug_key = cat.slug or ''
        cat.code = SLUG_TO_CODE.get(slug_key, (cat.slug or f'CAT{cat.id}').upper()[:50])
        cat.level = 1
        cat.sort_order = cat.order or 0
        cat.save(update_fields=['code', 'level', 'sort_order'])

    # Convert SubCategory rows into child Category rows
    for sub in SubCategory.objects.select_related('category').all():
        parent = sub.category
        base_code = f'{parent.code}-{(sub.slug or str(sub.id)).upper()}'[:50]
        code = base_code
        counter = 1
        while Category.objects.filter(code=code).exists():
            code = f'{base_code[:46]}-{counter}'
            counter += 1

        Category.objects.create(
            code=code,
            name_ar=sub.name_ar,
            name_en=sub.name_en or '',
            parent=parent,
            level=2,
            sort_order=0,
            is_active=sub.is_active,
            slug=None,
            description_ar='',
            icon='',
            order=0,
        )


def reverse_assign(apps, schema_editor):
    Category = apps.get_model('categories', 'Category')
    Category.objects.filter(level__gt=1).delete()
    for cat in Category.objects.filter(parent=None):
        cat.code = None
        cat.level = 1
        cat.sort_order = 0
        cat.save(update_fields=['code', 'level', 'sort_order'])


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0002_add_unit_en_options_en'),
    ]

    operations = [
        # ── Step 1: Make slug nullable ────────────────────────────────
        migrations.AlterField(
            model_name='category',
            name='slug',
            field=models.SlugField(max_length=100, null=True, blank=True, unique=True),
        ),

        # ── Step 2: Add new fields (code nullable first) ──────────────
        migrations.AddField(
            model_name='category',
            name='code',
            field=models.CharField(
                max_length=50, null=True, blank=True,
                verbose_name='كود التصنيف',
            ),
        ),
        migrations.AddField(
            model_name='category',
            name='parent',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='children',
                to='categories.category',
                verbose_name='التصنيف الأب',
            ),
        ),
        migrations.AddField(
            model_name='category',
            name='level',
            field=models.PositiveIntegerField(default=1, verbose_name='المستوى'),
        ),
        migrations.AddField(
            model_name='category',
            name='sort_order',
            field=models.PositiveIntegerField(default=0, verbose_name='الترتيب'),
        ),
        migrations.AddField(
            model_name='category',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),

        # ── Step 3: Data migration ────────────────────────────────────
        migrations.RunPython(
            assign_codes_and_create_children,
            reverse_assign,
        ),

        # ── Step 4: Make code non-nullable + unique ───────────────────
        migrations.AlterField(
            model_name='category',
            name='code',
            field=models.CharField(
                max_length=50, unique=True,
                verbose_name='كود التصنيف',
            ),
        ),

        # ── Step 5: Update ordering ───────────────────────────────────
        migrations.AlterModelOptions(
            name='category',
            options={
                'ordering': ['sort_order', 'order', 'name_ar'],
                'verbose_name': 'تصنيف',
                'verbose_name_plural': 'التصنيفات',
            },
        ),
    ]

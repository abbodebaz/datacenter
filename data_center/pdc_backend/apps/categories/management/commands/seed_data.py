"""
Management command: seed_data
Populates the database with initial categories, sub-categories,
attribute schemas, and a Super Admin user.

Usage:
    python manage.py seed_data
    python manage.py seed_data --superuser-email admin@baytalebaa.com --superuser-password MySecurePass123
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

CATEGORIES = [
    {
        'name_ar': 'السيراميك والبلاط',
        'name_en': 'Ceramics & Tiles',
        'slug': 'ceramics-tiles',
        'icon': '🔲',
        'attributes': [
            {'key': 'size', 'label_ar': 'المقاس', 'label_en': 'Size', 'type': 'text', 'unit': 'سم×سم', 'required': True, 'help_text': 'مثال: 60×60', 'options': []},
            {'key': 'thickness', 'label_ar': 'السماكة', 'label_en': 'Thickness', 'type': 'number', 'unit': 'مم', 'required': False, 'help_text': '', 'options': []},
            {'key': 'surface_finish', 'label_ar': 'نوع السطح', 'label_en': 'Surface Finish', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['مط', 'لامع', 'ساتان', 'خشن', 'ملمس']},
            {'key': 'material', 'label_ar': 'المادة', 'label_en': 'Material', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['بورسلان', 'سيراميك', 'حجر طبيعي']},
            {'key': 'water_absorption', 'label_ar': 'امتصاص الماء', 'label_en': 'Water Absorption', 'type': 'number', 'unit': '%', 'required': False, 'help_text': '', 'options': []},
            {'key': 'slip_resistance', 'label_ar': 'مقاومة الانزلاق', 'label_en': 'Slip Resistance', 'type': 'select', 'unit': '', 'required': False, 'help_text': '', 'options': ['R9', 'R10', 'R11', 'R12']},
            {'key': 'usage', 'label_ar': 'مجال الاستخدام', 'label_en': 'Usage', 'type': 'multi_select', 'unit': '', 'required': True, 'help_text': '', 'options': ['أرضيات', 'جدران', 'خارجي', 'داخلي', 'حمام', 'مطبخ']},
            {'key': 'pei_rating', 'label_ar': 'تقييم PEI', 'label_en': 'PEI Rating', 'type': 'select', 'unit': '', 'required': False, 'help_text': '', 'options': ['I', 'II', 'III', 'IV', 'V']},
        ],
    },
    {
        'name_ar': 'الرخام والحجر الطبيعي',
        'name_en': 'Marble & Natural Stone',
        'slug': 'marble-stone',
        'icon': '🏛️',
        'attributes': [
            {'key': 'stone_type', 'label_ar': 'نوع الحجر', 'label_en': 'Stone Type', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['رخام', 'غرانيت', 'تراورتين', 'أونيكس', 'حجر جيري', 'بازالت']},
            {'key': 'size', 'label_ar': 'المقاس', 'label_en': 'Size', 'type': 'text', 'unit': 'سم×سم', 'required': True, 'help_text': '', 'options': []},
            {'key': 'thickness', 'label_ar': 'السماكة', 'label_en': 'Thickness', 'type': 'number', 'unit': 'سم', 'required': False, 'help_text': '', 'options': []},
            {'key': 'finish', 'label_ar': 'التشطيب', 'label_en': 'Finish', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['مصقول', 'مط', 'مشطوف', 'سكابا', 'مشطور']},
            {'key': 'vein_pattern', 'label_ar': 'نمط العروق', 'label_en': 'Vein Pattern', 'type': 'text', 'unit': '', 'required': False, 'help_text': '', 'options': []},
            {'key': 'import_grade', 'label_ar': 'درجة الاستيراد', 'label_en': 'Import Grade', 'type': 'select', 'unit': '', 'required': False, 'help_text': '', 'options': ['A', 'B', 'C', 'Commercial']},
        ],
    },
    {
        'name_ar': 'الأثاث والمفروشات',
        'name_en': 'Furniture & Furnishings',
        'slug': 'furniture',
        'icon': '🛋️',
        'attributes': [
            {'key': 'furniture_type', 'label_ar': 'نوع الأثاث', 'label_en': 'Furniture Type', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['كنب', 'طاولة', 'كرسي', 'خزانة', 'سرير', 'رف', 'مكتب']},
            {'key': 'dimensions', 'label_ar': 'الأبعاد', 'label_en': 'Dimensions', 'type': 'dimensions', 'unit': 'سم', 'required': True, 'help_text': 'الطول × العرض × الارتفاع', 'options': []},
            {'key': 'material', 'label_ar': 'الخامة', 'label_en': 'Material', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['خشب صلب', 'MDF', 'معدن', 'نسيج', 'جلد طبيعي', 'جلد صناعي', 'زجاج', 'رخام']},
            {'key': 'seat_capacity', 'label_ar': 'سعة الجلوس', 'label_en': 'Seat Capacity', 'type': 'number', 'unit': 'شخص', 'required': False, 'help_text': '', 'options': []},
            {'key': 'style', 'label_ar': 'الأسلوب', 'label_en': 'Style', 'type': 'select', 'unit': '', 'required': False, 'help_text': '', 'options': ['كلاسيك', 'معاصر', 'حديث', 'عربي', 'بوهيمي']},
            {'key': 'assembly_required', 'label_ar': 'يتطلب تجميع', 'label_en': 'Assembly Required', 'type': 'boolean', 'unit': '', 'required': False, 'help_text': '', 'options': []},
            {'key': 'weight_capacity', 'label_ar': 'الحمل الأقصى', 'label_en': 'Weight Capacity', 'type': 'number', 'unit': 'كجم', 'required': False, 'help_text': '', 'options': []},
        ],
    },
    {
        'name_ar': 'الدهانات والطلاء',
        'name_en': 'Paints & Coatings',
        'slug': 'paints-coatings',
        'icon': '🎨',
        'attributes': [
            {'key': 'paint_type', 'label_ar': 'نوع الطلاء', 'label_en': 'Paint Type', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['مائي', 'زيتي', 'إبوكسي', 'بولي يوريثان', 'أكريليك']},
            {'key': 'sheen_level', 'label_ar': 'درجة اللمعان', 'label_en': 'Sheen Level', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['مط', 'شبه مط', 'حريري', 'نصف لامع', 'لامع']},
            {'key': 'coverage', 'label_ar': 'قدرة التغطية', 'label_en': 'Coverage', 'type': 'number', 'unit': 'م²/لتر', 'required': True, 'help_text': '', 'options': []},
            {'key': 'drying_time', 'label_ar': 'وقت الجفاف', 'label_en': 'Drying Time', 'type': 'text', 'unit': '', 'required': False, 'help_text': 'مثال: ٢ ساعة للمس، ٨ ساعات للتغطية', 'options': []},
            {'key': 'voc_content', 'label_ar': 'محتوى VOC', 'label_en': 'VOC Content', 'type': 'select', 'unit': '', 'required': False, 'help_text': '', 'options': ['منخفض', 'متوسط', 'عالي', 'خالٍ']},
            {'key': 'surface_type', 'label_ar': 'نوع السطح', 'label_en': 'Surface Type', 'type': 'multi_select', 'unit': '', 'required': True, 'help_text': '', 'options': ['جدران داخلية', 'جدران خارجية', 'أسقف', 'معدن', 'خشب', 'بلاستيك']},
            {'key': 'coats_required', 'label_ar': 'عدد الطبقات', 'label_en': 'Coats Required', 'type': 'number', 'unit': 'طبقة', 'required': False, 'help_text': '', 'options': []},
        ],
    },
    {
        'name_ar': 'إضاءة وكهرباء',
        'name_en': 'Lighting & Electrical',
        'slug': 'lighting-electrical',
        'icon': '💡',
        'attributes': [
            {'key': 'light_type', 'label_ar': 'نوع الإضاءة', 'label_en': 'Light Type', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['LED', 'هالوجين', 'فلورسنت', 'لمبة تقليدية', 'ذكية']},
            {'key': 'wattage', 'label_ar': 'القدرة الكهربائية', 'label_en': 'Wattage', 'type': 'number', 'unit': 'واط', 'required': True, 'help_text': '', 'options': []},
            {'key': 'lumens', 'label_ar': 'الشدة الضوئية', 'label_en': 'Lumens', 'type': 'number', 'unit': 'لومن', 'required': False, 'help_text': '', 'options': []},
            {'key': 'color_temp', 'label_ar': 'درجة حرارة اللون', 'label_en': 'Color Temperature', 'type': 'select', 'unit': 'K', 'required': True, 'help_text': '', 'options': ['2700K دافئ', '3000K دافئ', '4000K محايد', '5000K بارد', '6500K بارد']},
            {'key': 'ip_rating', 'label_ar': 'درجة الحماية IP', 'label_en': 'IP Rating', 'type': 'select', 'unit': '', 'required': False, 'help_text': '', 'options': ['IP20', 'IP44', 'IP54', 'IP65', 'IP67']},
            {'key': 'voltage', 'label_ar': 'الجهد الكهربائي', 'label_en': 'Voltage', 'type': 'select', 'unit': 'V', 'required': True, 'help_text': '', 'options': ['12V', '24V', '110V', '220V']},
            {'key': 'dimmable', 'label_ar': 'قابل للتعتيم', 'label_en': 'Dimmable', 'type': 'boolean', 'unit': '', 'required': False, 'help_text': '', 'options': []},
            {'key': 'lifespan', 'label_ar': 'العمر الافتراضي', 'label_en': 'Lifespan', 'type': 'number', 'unit': 'ساعة', 'required': False, 'help_text': '', 'options': []},
        ],
    },
    {
        'name_ar': 'سباكة وصرف',
        'name_en': 'Plumbing & Drainage',
        'slug': 'plumbing-drainage',
        'icon': '🔧',
        'attributes': [
            {'key': 'product_type', 'label_ar': 'نوع المنتج', 'label_en': 'Product Type', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['حوض', 'مرحاض', 'دش', 'صنبور', 'بطانية', 'خرطوم', 'اتصالات', 'صمامات']},
            {'key': 'material', 'label_ar': 'الخامة', 'label_en': 'Material', 'type': 'select', 'unit': '', 'required': True, 'help_text': '', 'options': ['نحاس', 'PVC', 'فولاذ مقاوم للصدأ', 'سيراميك', 'خزف', 'بولي إيثيلين']},
            {'key': 'pipe_diameter', 'label_ar': 'قطر الأنبوب', 'label_en': 'Pipe Diameter', 'type': 'number', 'unit': 'بوصة', 'required': False, 'help_text': '', 'options': []},
            {'key': 'pressure_rating', 'label_ar': 'ضغط العمل', 'label_en': 'Pressure Rating', 'type': 'number', 'unit': 'بار', 'required': False, 'help_text': '', 'options': []},
            {'key': 'flow_rate', 'label_ar': 'معدل التدفق', 'label_en': 'Flow Rate', 'type': 'number', 'unit': 'لتر/دقيقة', 'required': False, 'help_text': '', 'options': []},
            {'key': 'water_saving', 'label_ar': 'موفر للماء', 'label_en': 'Water Saving', 'type': 'boolean', 'unit': '', 'required': False, 'help_text': '', 'options': []},
            {'key': 'certifications', 'label_ar': 'الشهادات', 'label_en': 'Certifications', 'type': 'multi_select', 'unit': '', 'required': False, 'help_text': '', 'options': ['SASO', 'CE', 'ISO 9001', 'WRAS', 'NSF']},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed initial data: categories, attribute schemas, and super admin user'

    def add_arguments(self, parser):
        parser.add_argument('--superuser-email', default='admin@baytalebaa.com')
        parser.add_argument('--superuser-password', default='PDC@2025Admin!')

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\n🌱 Seeding Bayt Alebaa PDC initial data...\n'))

        from apps.categories.models import Category, CategoryAttributeSchema

        # ── Categories & Attribute Schemas ──────────────────────────────
        for idx, cat_data in enumerate(CATEGORIES):
            attrs = cat_data.pop('attributes')
            cat, created = Category.objects.update_or_create(
                slug=cat_data['slug'],
                defaults={**cat_data, 'order': idx + 1, 'is_active': True},
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action} category: {cat.name_ar}')

            # Attribute schemas
            for order, attr in enumerate(attrs):
                CategoryAttributeSchema.objects.update_or_create(
                    category=cat,
                    field_key=attr['key'],
                    defaults={
                        'field_label_ar': attr['label_ar'],
                        'field_label_en': attr['label_en'],
                        'field_type': attr['type'],
                        'unit': attr.get('unit', ''),
                        'options': attr.get('options', []),
                        'is_required': attr.get('required', False),
                        'help_text_ar': attr.get('help_text', ''),
                        'order': order,
                    },
                )
            self.stdout.write(f'    → {len(attrs)} attribute schemas')

        # ── Super Admin User ─────────────────────────────────────────────
        email = options['superuser_email']
        password = options['superuser_password']

        if not User.objects.filter(email=email).exists():
            user = User.objects.create_superuser(
                email=email,
                password=password,
                name_ar='مدير النظام',
                name_en='System Admin',
                role='super_admin',
            )
            self.stdout.write(self.style.SUCCESS(f'\n  ✓ Super admin created: {email}'))
        else:
            self.stdout.write(f'\n  → Super admin already exists: {email}')

        self.stdout.write(self.style.SUCCESS('\n✅ Seed complete!\n'))
        self.stdout.write(f'  Login: {email}')
        self.stdout.write(f'  Pass:  {password}\n')

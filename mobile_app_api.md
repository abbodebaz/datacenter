# APIs تطبيق الجوال — كتالوج الزوار

**Base URL:** `https://your-domain.com/api/v1`

> جميع هذه الـ endpoints **لا تحتاج تسجيل دخول** — متاحة للعموم (GET فقط).

---

## المنتجات

### قائمة المنتجات

```
GET /products/
```

**Query Parameters (الفلاتر):**

| المعامل | النوع | الوصف |
|---|---|---|
| `page` | int | رقم الصفحة |
| `page_size` | int | عدد النتائج (افتراضي 24) |
| `search` | string | بحث في الاسم والـ SKU والوصف |
| `category` | string | slug الفئة (مثل `ceramics`) |
| `brand` | int | ID الماركة |
| `status` | string | `نشط` أو `مسودة` |
| `inventory_type` | string | `local` أو `import` |
| `color` | string | اللون (بحث جزئي) |
| `origin_country` | string | بلد المنشأ |
| `price_min` | decimal | أدنى سعر |
| `price_max` | decimal | أعلى سعر |
| `has_images` | bool | فقط المنتجات التي عندها صورة رئيسية |
| `has_lifestyle_image` | bool | فقط من عندها صور ديكورية |
| `ordering` | string | `-price_sar`، `price_sar`، `-created_at`، `product_name_ar` |

**الحقول المُرجَعة:**

```json
{
  "count": 120,
  "next": "?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "sku": "CRM001",
      "product_name_ar": "بلاطة سيراميك ...",
      "product_name_en": "Ceramic Tile ...",
      "category": 3,
      "category_name": "سيراميك",
      "brand_name": "RAK",
      "status": "نشط",
      "inventory_type": "import",
      "color": "أبيض",
      "price_sar": "85.00",
      "stock_status": "متوفر",
      "main_image_url": "https://...",
      "description_ar": "...",
      "attributes": {}
    }
  ]
}
```

---

### تفاصيل منتج

```
GET /products/{id}/
```

يرجع كل البيانات + مصفوفة الصور الكاملة + `attribute_schema` (أسماء الحقول بالعربي):

```json
{
  "id": 1,
  "sku": "CRM001",
  "product_name_ar": "...",
  "product_name_en": "...",
  "description_ar": "...",
  "description_en": "...",
  "category": 3,
  "category_name": "سيراميك",
  "category_slug": "ceramics",
  "subcategory_name": "...",
  "brand": 2,
  "brand_name": "RAK",
  "price_sar": "85.00",
  "color": "أبيض",
  "origin_country": "الإمارات",
  "dimensions": "...",
  "stock_status": "متوفر",
  "attributes": { "size": "60x60", "finish": "مطفأ" },
  "attribute_schema": [
    {
      "key": "size",
      "label_ar": "المقاس",
      "label_en": "Size",
      "type": "text",
      "unit": "سم",
      "required": true,
      "options": []
    }
  ],
  "images": [
    {
      "id": 10,
      "image_type": "main",
      "url": "https://...",
      "order": 0,
      "status": "approved",
      "is_ai_generated": false
    },
    {
      "id": 11,
      "image_type": "lifestyle",
      "url": "https://...",
      "order": 1,
      "status": "approved",
      "is_ai_generated": true
    }
  ]
}
```

---

### صور منتج (منفصلة)

```
GET /products/{id}/images/
```

نفس مصفوفة `images` الموجودة في تفاصيل المنتج — مفيدة لتحميلها بشكل منفصل.

---

## الفئات

### قائمة الفئات

```
GET /categories/
```

```json
[
  {
    "id": 1,
    "name_ar": "سيراميك",
    "name_en": "Ceramics",
    "slug": "ceramics",
    "icon": "🏠",
    "is_active": true,
    "subcategories": [
      {
        "id": 5,
        "name_ar": "أرضيات",
        "name_en": "Floors",
        "slug": "floors",
        "is_active": true
      }
    ]
  }
]
```

### تفاصيل فئة

```
GET /categories/{id}/
```

### الفئات الفرعية لفئة معينة

```
GET /categories/{id}/subcategories/
```

---

## الماركات

### قائمة الماركات

```
GET /brands/
```

**Query Parameters:**

| المعامل | النوع | الوصف |
|---|---|---|
| `search` | string | بحث في اسم الماركة |

```json
[
  {
    "id": 1,
    "name": "RAK",
    "name_ar": "راك",
    "origin_country": "UAE",
    "logo_url": "https://..."
  }
]
```

### تفاصيل ماركة

```
GET /brands/{id}/
```

---

## أنواع الصور (`image_type`)

| القيمة | الوصف |
|---|---|
| `main` | الصورة الرئيسية — تُعرض في قوائم المنتجات |
| `gallery` | معرض الصور |
| `lifestyle` | صورة ديكورية (تُظهر المنتج في سياقه) |
| `detail` | صورة تفاصيل مقرّبة |
| `technical` | مخطط تقني أو أبعاد |

---

## ملاحظات مهمة

### فلترة المنتجات المنشورة فقط

دائماً أضف `status=نشط` في قوائم المنتجات لإظهار المنتجات المتاحة فقط:

```
GET /products/?status=نشط&has_images=true
```

### Pagination

كل استجابة قائمة تأتي بهذا الشكل:

```json
{
  "count": 200,
  "next": "https://your-domain.com/api/v1/products/?page=2",
  "previous": null,
  "results": []
}
```

### مثال: تصفح كتالوج سيراميك مع فلتر سعر

```
GET /products/?status=نشط&category=ceramics&price_min=50&price_max=200&ordering=-created_at&page=1&page_size=20
```

### مثال: بحث بالاسم

```
GET /products/?status=نشط&search=باركيه
```

# PROMPT.md
## Bayt Alebaa — Product Data Center
## بيت الإباء | مركز بيانات المنتجات

---

You are an expert full-stack software engineer tasked with building the **Bayt Alebaa Product Data Center** — a centralized digital platform for managing and displaying all products of Bayt Alebaa, a premium Saudi building materials company.

---

## Your Instructions

**Step 1 — Read the project files first:**
Before writing a single line of code, read the following two files that are in this project:

1. `gemini.md` — Contains the full technical specification: all features, API endpoints, database models, Django apps structure, AI prompts, tech stack, and implementation details. Follow this file step-by-step.

2. `brand-guidelines.md` — Contains the complete visual identity and UI/UX guidelines: colors, typography, components, RTL rules, image standards, and screen layouts. Every UI element you build must follow this file exactly.

---

## Project Overview

Build a **Product Data Center (PDC)** platform with the following tech stack (non-negotiable):

| Layer | Technology |
|-------|-----------|
| Backend | Python + Django + Django REST Framework |
| Frontend | React + TypeScript |
| Database | PostgreSQL (with JSONB for dynamic attributes) |
| Image Storage | Cloudflare R2 (S3-compatible) |
| Caching | Redis |
| Auth | JWT (djangorestframework-simplejwt) |
| Task Queue | Celery |
| API Docs | Swagger (drf-spectacular) |
| CI/CD | GitHub Actions + Docker |

---

## Core Features to Build (in order)

Follow the exact phase order from `gemini.md`:

### Phase 1 — Analysis & Setup (2 weeks)
- [ ] Design database schema for all 6 product categories
- [ ] Set up Django project structure with all apps
- [ ] Configure PostgreSQL, Redis, Cloudflare R2
- [ ] Set up Docker + GitHub Actions
- [ ] Build wireframes for all 9 main screens

### Phase 2 — Product Data Center & Users (2 weeks)
- [ ] Product model with shared base fields (SKU, name AR/EN, category, status, brand, etc.)
- [ ] Dynamic attributes system (JSONB) per category
- [ ] User management with 5 roles: عام / مبيعات / مدير قسم / تسويق / Super Admin
- [ ] JWT authentication
- [ ] Permission matrix enforcement (see brand-guidelines.md section 10)
- [ ] Django Admin panel

### Phase 3 — Catalog & Search (3 weeks)
- [ ] Product listing with Grid view and List view
- [ ] Advanced filters: category, status, brand, availability, attributes
- [ ] Full-text search in Arabic and English (PostgreSQL)
- [ ] Product detail page with image gallery
- [ ] PDF catalog generation (dynamic, user-selected products)
- [ ] Flipbook viewer

### Phase 4 — AI & Visual Engine (4 weeks)
- [ ] Background removal service (Remove.bg API or rembg local)
- [ ] Decorative image generation via AI (Stable Diffusion / Midjourney API)
- [ ] AI processing via Celery Queue (non-blocking)
- [ ] Results stored in Cloudflare R2 under `lifestyle/` folder
- [ ] Review-before-publish workflow for AI-generated images
- [ ] Multi-product simultaneous AI processing support

### Phase 5 — Analytics & Integrations (2 weeks)
- [ ] Analytics dashboard: completeness scores per category
- [ ] Missing images report
- [ ] SAP integration (Celery task every 30 minutes — prices & stock)
- [ ] E-commerce store URL linking per product (auto via SKU matching)
- [ ] Webhook to store on product/image update

### Phase 6 — Testing & Launch (1 week)
- [ ] Full UAT testing
- [ ] User training documentation in Arabic
- [ ] Performance validation: API < 300ms, 200+ concurrent users
- [ ] Official launch

---

## Product Categories & Dynamic Attributes

Each category has its own dynamic fields stored in JSONB. Build them exactly as specified in `gemini.md` section "Dynamic Attributes Reference":

- **السيراميك والبورسلان:** المقاس، نوع السطح، معدل الامتصاص، R-Value، PEI، السماكة، مكان الاستخدام
- **الرخام:** النوع، المنشأ الجغرافي، اللون والتشكيل، السماكة، معالجة السطح
- **الأدوات الصحية:** نوع المنتج، المادة، أسلوب التركيب، تقنية التوفير، شهادات المطابقة
- **المطابخ:** نوع الخزانة، مادة الهيكل، نوع الواجهة، نظام الفتح، سطح العمل
- **الديكور:** الفئة الديكورية، الأسلوب التصميمي، الألوان المتاحة، مكان الاستخدام
- **المواد المساندة:** الحقول الأساسية المشتركة فقط

---

## UI/UX Rules (from brand-guidelines.md)

When building any frontend component, strictly follow these:

1. **Direction:** All UI is `dir="rtl"` — Arabic first
2. **Colors:** Use exact HEX values from brand-guidelines.md section 3
3. **Typography:** IBM Plex Arabic for Arabic text, Inter for data/tables, JetBrains Mono for SKU codes
4. **Components:** Product cards, status badges, buttons, tables — all as specified in section 6
5. **Screens:** Build all 9 screens listed in brand-guidelines.md section 9
6. **Role-Based UI:** Hide/show elements based on user role as per section 10
7. **Image display:** Enforce 4:3 ratio for gallery, 1:1 for main, 16:9 for lifestyle
8. **Performance:** Lazy loading + Skeleton screens on all data-heavy views
9. **Responsive:** Desktop (sidebar 260px) + Tablet + Mobile

---

## API Design Rules

Follow RESTful standards. All endpoints documented on `/api/docs/` via Swagger.

Base prefix: `/api/v1/`

Key endpoints to implement:
- `GET/POST /products/`
- `GET/PUT/PATCH/DELETE /products/{id}/`
- `POST /products/{id}/publish/`
- `GET /products/{id}/attributes/`
- `GET/POST /products/{id}/images/`
- `POST /products/{id}/images/generate-url/` (Presigned R2 URL)
- `GET/POST /categories/`
- `GET/POST /categories/{id}/attributes/`
- `POST /auth/login/` → returns Access + Refresh Token
- `GET /users/me/`
- `GET /analytics/completeness/`

Supported query params on product list:
`?category=` `?search=` `?status=` `?brand=` `?ordering=` `?page=` `?page_size=` `?has_images=false`

---

## Image Storage Structure (Cloudflare R2)

```
products/{category_slug}/{sku}/main.jpg
products/{category_slug}/{sku}/gallery/01.jpg ... 08.jpg
products/{category_slug}/{sku}/detail/texture.jpg
products/{category_slug}/{sku}/lifestyle/room_01.jpg
products/{category_slug}/{sku}/technical/dimensions.pdf
```

Image requirements:
- Size: 2000×2000px (square, mandatory)
- Formats: JPG, JPEG, PNG, WebP only
- Max: 10MB per image
- Background: white or light gray `#F5F5F5`
- Naming: `SKU_ProductName_ViewType.jpg`

---

## Performance Requirements

- API response time: **≤ 300ms** for standard operations
- Concurrent users: **200+** in Phase 1
- Uptime: **99.5%** (High Availability)
- Daily automatic backup for DB and images
- All connections over **HTTPS / TLS 1.3**
- Full **i18n** support: Arabic + English

---

## Important Notes

- **Never** hard-code category attributes — use the dynamic JSONB system
- **Always** process AI tasks via Celery — never block the main API
- **Always** show AI-generated images as "pending review" before publishing
- **Scope** each department manager (مدير قسم) to their own category only — enforce at query level
- **Log** all operations in the `Logs` Django app for the audit trail screen
- SAP sync runs every **30 minutes** via Celery beat
- The `integrations` app must be **fully decoupled** from the rest of the system

---

## Definition of Done

A feature is considered complete when:
1. Backend API endpoint is implemented and tested
2. Swagger documentation is updated
3. Frontend component is built following brand-guidelines.md
4. Role-based access is enforced
5. Arabic RTL rendering is verified
6. Performance benchmark is met (≤ 300ms)

---

*Project: مركز بيانات المنتجات والصور | Bayt Alebaa*  
*Prepared by: Digital Transformation Division | February 2025*
"""
Gemini AI Service Wrapper — Bayt Alebaa PDC
Based on ai_prompts.py (gemini.md specification)
"""
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def _run_gemini_model(model_name: str, prompt: str, cfg: dict, image=None) -> str:
    """Run a single Gemini model and return raw text."""
    import google.generativeai as genai
    model = genai.GenerativeModel(model_name)
    contents = [image, prompt] if image else [prompt]
    response = model.generate_content(
        contents,
        generation_config={
            'temperature': cfg['temperature'],
            'max_output_tokens': cfg['max_output_tokens'],
        }
    )
    return response.text.strip()


def call_gemini(prompt: str, config_key: str = 'flash', image=None) -> dict | str:
    """
    Wrapper for all Gemini API calls with automatic fallback on quota errors.
    Returns parsed JSON dict for structured prompts, or raw string for text.
    """
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)

    cfg = settings.GEMINI_CONFIG[config_key]
    models_to_try = [cfg['model']]
    if cfg.get('fallback_model'):
        models_to_try.append(cfg['fallback_model'])

    last_error = None
    for model_name in models_to_try:
        try:
            text = _run_gemini_model(model_name, prompt, cfg, image)

            if text.startswith('{') or text.startswith('['):
                text = text.replace('```json', '').replace('```', '').strip()
                try:
                    return json.loads(text)
                except json.JSONDecodeError:
                    retry_prompt = prompt + '\n\nIMPORTANT: Return ONLY valid JSON. No other text.'
                    retry_text = _run_gemini_model(model_name, retry_prompt, cfg)
                    retry_text = retry_text.replace('```json', '').replace('```', '').strip()
                    return json.loads(retry_text)

            return text

        except Exception as e:
            err_str = str(e)
            logger.error(f"Gemini API error for config '{config_key}' model '{model_name}': {e}")
            last_error = e
            # Retry with fallback only on quota/rate-limit errors (429)
            if '429' in err_str or 'quota' in err_str.lower() or 'rate' in err_str.lower():
                logger.warning(f"Quota exceeded on '{model_name}', trying fallback...")
                continue
            # For other errors (auth, network), don't try fallback
            raise

    logger.error(f"All Gemini models exhausted for config '{config_key}'")
    raise last_error


# ─── AI Prompts from gemini.md ────────────────────────────────────────────────

DECORATIVE_IMAGE_SYSTEM = """
You are a professional interior design visualization expert specializing in
Saudi Arabian and Gulf-region residential interiors. You generate photorealistic
interior scene descriptions for product placement.
"""

DECORATIVE_IMAGE_USER = """
You are given a product from Bayt Alebaa, a premium building materials company in Saudi Arabia.

Product Details:
- Product Name: {product_name_ar} / {product_name_en}
- Category: {category}
- SKU: {sku}
- Dimensions: {dimensions}
- Color/Finish: {color_finish}
- Material: {material}
- Aesthetic Style: {aesthetic_style}

Task:
Generate a detailed image generation prompt that will place this product in a realistic,
luxurious interior setting appropriate for Saudi/Gulf residential design.

Requirements:
1. Room style: premium and aspirational — modern Arabic luxury or contemporary Gulf aesthetic
2. Lighting: warm, natural, photorealistic (golden hour or soft diffused daylight)
3. Product placement: the HERO element — prominently placed and clearly visible
4. Complementary décor: matches the product's style without overpowering it
5. Camera angle: eye-level or slight elevation, wide enough to show context
6. Quality markers: 8K, photorealistic, architectural visualization, interior photography

Room Assignment by Category:
- سيراميك / بورسلان → living room floor, entrance hall, or open-plan kitchen
- رخام → grand entrance, feature wall, bathroom countertop, or dining area
- أدوات صحية → master bathroom, luxury en-suite
- مطابخ → full kitchen scene, breakfast nook
- ديكور → living room accent wall, corridor, or lounge area
- مواد مساندة → construction context, material closeup in situ

Output: Return ONLY the image generation prompt as a single paragraph.
No explanations, no JSON, no markdown. Max 200 words.
"""

VISION_USER = """
Analyze this product image from Bayt Alebaa, a Saudi building materials company.

Extract the following information if visible or inferable:

Respond ONLY with valid JSON — no preamble, no markdown, no explanation:

{
  "product_category": "one of: سيراميك, بورسلان, رخام, أدوات صحية, مطابخ, ديكور, مواد مساندة",
  "color_family": "primary color in Arabic",
  "finish_type": "مط | لامع | نصف لامع | أنتيك | نانو | مُزخرف",
  "pattern_description": "brief Arabic description of pattern/texture",
  "suggested_use": "أرضيات | جدران | حمامات | مطابخ | خارجي | داخلي",
  "aesthetic_style": "كلاسيك | عصري | صناعي | طبيعي | فاخر | مينيمال",
  "inventory_type": "دوري | ستوك | منتهي | null",
  "confidence": "high | medium | low"
}

Rules:
- Use Arabic for all descriptive fields
- Do NOT guess dimensions or prices — omit them
- If a field cannot be determined from the image, use null
"""

DESCRIPTION_SYSTEM = """
You are a professional Arabic copywriter specializing in luxury building materials
and interior design products for the Saudi and Gulf market.
"""

DESCRIPTION_USER = """
Write a professional Arabic product description for this building material product.

Product Data:
- Name (AR): {product_name_ar}
- Name (EN): {product_name_en}
- Category: {category}
- SKU: {sku}
- Material: {material}
- Color/Finish: {color_finish}
- Dimensions: {dimensions}
- Suggested Use: {suggested_use}
- Style: {aesthetic_style}
- Brand/Origin: {brand} — {origin_country}

Requirements:
1. Language: Modern Standard Arabic (فصحى معاصرة) — professional yet approachable
2. Length: 60–90 words only
3. Structure: Opening statement → Key properties → Ideal use case → Aspirational closing
4. Tone: Refined, confident, luxury-oriented
5. Mention the product name at least once
6. Do NOT mention pricing, availability, or competitor names
7. Avoid clichés: "أفضل جودة" / "الأفضل في السوق"

Output: Return ONLY the Arabic description paragraph. No labels, no JSON.
"""

APPROVAL_VALIDATOR_USER = """
A team member has submitted a new product addition request for Bayt Alebaa.

Submitted Data:
{submitted_product_json}

Existing SKUs in system:
{existing_skus_list}

Validate the submission against these criteria:

1. Product name is clear and professional (not vague like "منتج جديد" or "test")
2. Category is correctly assigned based on the description
3. Dimensions format is valid (e.g., "60×60 سم", "120×60 سم", "40×40 سم")
4. Description length: 30–150 words if provided
5. SKU does not duplicate any existing SKU
6. Inventory type is one of: دوري / ستوك / منتهي
7. Image appears to be a real product photo (not placeholder, screenshot, or watermarked)

Respond ONLY with valid JSON:
{
  "validation_passed": true | false,
  "score": 0-100,
  "issues": [
    {
      "field": "field_name",
      "severity": "blocking | warning | suggestion",
      "message_ar": "رسالة للمستخدم بالعربية"
    }
  ],
  "auto_approve_eligible": true | false,
  "reviewer_notes_ar": "ملاحظات للمراجع (30 كلمة كحد أقصى)",
  "suggested_category": "if current category seems wrong",
  "duplicate_risk": "none | low | high"
}
"""


# ─── Service Functions ─────────────────────────────────────────────────────────

def generate_product_description(product) -> str:
    """Generate AI Arabic description for a product."""
    attrs = product.attributes or {}
    prompt = DESCRIPTION_USER.format(
        product_name_ar=product.product_name_ar,
        product_name_en=product.product_name_en or '—',
        category=product.category.name_ar,
        sku=product.sku,
        material=attrs.get('المادة', attrs.get('material', '—')),
        color_finish=f"{product.color} — {attrs.get('نوع السطح', '—')}",
        dimensions=attrs.get('المقاس', attrs.get('الأبعاد', '—')),
        suggested_use=attrs.get('مكان الاستخدام', '—'),
        aesthetic_style=attrs.get('الفئة الجمالية', attrs.get('الأسلوب التصميمي', '—')),
        brand=product.brand.name_ar if product.brand else '—',
        origin_country=product.origin_country or '—',
    )
    return call_gemini(f"{DESCRIPTION_SYSTEM}\n\n{prompt}", config_key='creative')


def analyze_product_image(image_data) -> dict:
    """Analyze product image using Gemini Vision."""
    return call_gemini(VISION_USER, config_key='vision', image=image_data)


def generate_decorative_image_prompt(product) -> str:
    """Generate Stable Diffusion prompt for decorative image."""
    attrs = product.attributes or {}
    prompt = DECORATIVE_IMAGE_USER.format(
        product_name_ar=product.product_name_ar,
        product_name_en=product.product_name_en or '—',
        category=product.category.name_ar,
        sku=product.sku,
        dimensions=attrs.get('المقاس', attrs.get('الأبعاد', '—')),
        color_finish=f"{product.color} — {attrs.get('نوع السطح', '—')}",
        material=attrs.get('المادة', '—'),
        aesthetic_style=attrs.get('الفئة الجمالية', attrs.get('الأسلوب التصميمي', 'فاخر')),
    )
    return call_gemini(f"{DECORATIVE_IMAGE_SYSTEM}\n\n{prompt}", config_key='creative')

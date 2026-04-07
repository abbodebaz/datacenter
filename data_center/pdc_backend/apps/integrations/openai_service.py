"""
OpenAI Service — Bayt Alebaa PDC
Text generation, vision analysis, and AI description tasks.
"""
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def call_openai(prompt: str, system: str = '', temperature: float = 0.7, max_tokens: int = 600) -> str:
    """
    Wrapper for OpenAI ChatCompletion.
    Returns raw text string.
    """
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    messages = []
    if system:
        messages.append({'role': 'system', 'content': system})
    messages.append({'role': 'user', 'content': prompt})

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    return response.choices[0].message.content.strip()


DESCRIPTION_SYSTEM = (
    "You are a professional content writer specializing in luxury building materials and interior design "
    "for the Saudi and Gulf markets. You write marketing descriptions in both Arabic and English."
)

DESCRIPTION_USER = """
Write a bilingual marketing description for this building material product.
Return ONLY a JSON object with exactly two keys: "description_ar" and "description_en".

Product data:
- Arabic name: {product_name_ar}
- English name: {product_name_en}
- Category: {category}
- SKU: {sku}
- Material: {material}
- Color / Surface: {color_finish}
- Dimensions: {dimensions}
- Suggested use: {suggested_use}
- Aesthetic style: {aesthetic_style}
- Brand / Origin: {brand} — {origin_country}

Requirements for ARABIC (description_ar):
1. Contemporary, professional, fluent Modern Standard Arabic
2. Length: 60–90 words
3. Structure: opening sentence → key features → ideal use case → aspirational closing
4. Tone: refined, confident, luxury-focused
5. Mention the product name at least once
6. No prices, availability, or competitor names
7. Avoid clichés like "best quality" / "market leader"

Requirements for ENGLISH (description_en):
1. Professional, elegant British/Gulf-market English
2. Length: 50–80 words
3. Same structure as Arabic — adapted naturally for English readers
4. Tone: refined and aspirational

Return ONLY valid JSON — no markdown, no explanation:
{{"description_ar": "...", "description_en": "..."}}
"""


def generate_product_description(product) -> dict:
    """Returns dict with keys: description_ar, description_en"""
    attrs = product.attributes or {}
    prompt = DESCRIPTION_USER.format(
        product_name_ar=product.product_name_ar,
        product_name_en=product.product_name_en or '—',
        category=product.category.name_ar,
        sku=product.sku,
        material=attrs.get('material', attrs.get('المادة', '—')),
        color_finish=f"{product.color or '—'} — {attrs.get('surface_finish', attrs.get('نوع السطح', '—'))}",
        dimensions=attrs.get('size', attrs.get('المقاس', attrs.get('الأبعاد', '—'))),
        suggested_use=attrs.get('usage', attrs.get('مجال الاستخدام', '—')),
        aesthetic_style=attrs.get('aesthetic_style', attrs.get('الفئة الجمالية', '—')),
        brand=product.brand.name_ar if product.brand else '—',
        origin_country=product.origin_country or '—',
    )

    logger.info(f"Generating bilingual OpenAI description for product {product.sku}")
    raw = call_openai(
        prompt=prompt,
        system=DESCRIPTION_SYSTEM,
        temperature=0.75,
        max_tokens=500,
    )

    # Strip markdown fences if present
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1] if '\n' in raw else raw[3:]
        if raw.endswith('```'):
            raw = raw[:-3]
        raw = raw.strip()

    try:
        result = json.loads(raw)
        return {
            'description_ar': result.get('description_ar', ''),
            'description_en': result.get('description_en', ''),
        }
    except json.JSONDecodeError:
        logger.warning(f"Could not parse JSON from description generation, treating as AR-only: {raw[:100]}")
        return {'description_ar': raw, 'description_en': ''}


VISION_ANALYSIS_SYSTEM = (
    "You are an expert in building materials, interior finishing products, sanitary ware, "
    "outdoor products, and construction materials. "
    "Analyze the uploaded product image and return a JSON object. "
    "Always respond with valid JSON only — no markdown, no explanations."
)

VISION_ANALYSIS_PROMPT = """Analyze this building material/product image and return a JSON object with these fields:

1. product_type: نوع المنتج بالعربي
2. product_type_en: Product type in English
3. color: اللون بالعربي
4. color_en: Color in English
5. pattern: النمط بالعربي (إن وجد)
6. pattern_en: Pattern in English (if any)
7. surface: نوع السطح بالعربي
8. surface_en: Surface type in English
9. description_en: Full English description for image generation prompt — be HIGHLY DETAILED.
   For CARPET specifically: describe pile type (loop pile / cut pile / berber / tufted), pile height (low/medium/high), exact color combination, pattern direction (horizontal/vertical stripes, geometric, solid), texture appearance (dense, plush, ribbed, textured). Example: "commercial loop-pile carpet in dark charcoal and black tones with subtle thin stripe pattern, medium-low pile height, dense woven texture"
   For ALL materials: include exact color, texture, pattern, finish, and any distinguishing visual characteristics.
10. generation_mode: One of ["surface", "product", "showcase"]
11. recommended_placement: Where this product should appear
12. product_category: Main category
13. material_subtype: Specific material subtype from the list below

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL: CARPET (موكيت) vs AREA RUG (سجادة) DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the most important classification decision. Read ALL rules below before deciding.

CARPET (موكيت / broadloom / carpet tile) — generation_mode: "surface", material_subtype: "carpet"
Signs that it IS a carpet:
✓ Uniform textile/fiber texture across the entire surface (cut pile, loop pile, berber, tufted)
✓ Repeating geometric or striped pattern with NO border framing the edges
✓ Shown as a swatch, sample, roll, or flat sheet on neutral background
✓ Appears commercial — office, hotel, corridor style
✓ Long narrow strip format (typical broadloom roll sample)
✓ Surface texture shows individual fiber loops or cut pile
✓ Has stripe or linear pattern running across the full width (common in commercial carpet)
✓ Dark background with subtle linear/stripe texture = typical commercial broadloom carpet

AREA RUG (سجادة مفردة) — generation_mode: "product", material_subtype: "decorative_rug"
Signs that it IS an area rug:
✓ Clearly has a DECORATIVE BORDER or FRAME along all four edges
✓ Has fringe/tassel on the short ends
✓ Features intricate Persian, Turkish, or Oriental ornamental medallion pattern
✓ Is obviously a standalone finished piece with finished/sewn edges all around
✓ Very different pattern in the center vs border

DEFAULT RULE — When in doubt:
→ If the image shows a textile/fiber surface sample WITHOUT a clear decorative border/fringe → classify as "carpet" (surface mode)
→ Only classify as "decorative_rug" if it CLEARLY has a visible border frame or fringe/tassels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GENERATION MODE RULES:
- "surface": For materials that COVER SURFACES uniformly as continuous flooring or cladding (ceramic tiles, porcelain tiles, parquet, SPC/LVT/vinyl flooring, WALL-TO-WALL CARPET (موكيت), carpet tiles, wallpaper, wall cladding panels, natural stone slabs, marble slabs, pool tiles, mosaic tiles, decorative wall tiles)
  CRITICAL RULE: Wall-to-wall carpet (موكيت/broadloom carpet) = "surface". It covers the ENTIRE room floor continuously like parquet — NOT a product.
- "product": For STANDALONE OBJECTS placed IN a scene (faucets, mixers, showers, bathtubs, jacuzzi, kitchen sinks, toilets, bidets, outdoor furniture, patio umbrellas, artificial grass rolls, facade systems, lighting fixtures, SINGLE DECORATIVE AREA RUGS placed on top of a floor)
  IMPORTANT: A single decorative rug/area rug (سجادة مفردة decorative) = "product" ONLY if it clearly has a decorative border/fringe or is obviously a standalone ornamental piece.
- "showcase": For packaged/construction materials shown as product photography (adhesive bags/buckets, grout, silicone tubes, profiles, corner trims, expansion joints, waterproofing membranes, sealants, leveling compounds)

RECOMMENDED_PLACEMENT VALUES:
- For surface mode: "floor", "wall", or "both"
- For product mode: "bathroom", "kitchen", "outdoor", "pool_area", or "entrance"
- For showcase mode: "studio"

PRODUCT_CATEGORY VALUES:
- "flooring" (أرضيات)
- "wall_covering" (جدران)
- "sanitary" (أدوات صحية)
- "outdoor" (خارجي)
- "construction" (مواد بناء)
- "lighting" (إضاءة)

MATERIAL_SUBTYPE VALUES — pick the most specific match:
Surface materials:
- "carpet"          → wall-to-wall broadloom carpet / موكيت (entire room floor, no seams)
- "parquet"         → engineered or solid wood parquet / باركيه خشبي
- "lvt_spc"         → LVT / SPC / vinyl plank flooring (plastic wood-look planks)
- "rubber_flooring" → rubber gym/sports/playground flooring tiles or rolls (أرضيات مطاطية)
- "ceramic_tile"    → ceramic floor or wall tiles
- "porcelain_tile"  → porcelain tiles including large-format slabs
- "natural_stone"   → granite / travertine / slate / limestone (non-marble stone)
- "marble"          → marble slabs or tiles with veining
- "glass_block"     → glass blocks / بلوك زجاج
- "mosaic"          → mosaic tiles (small piece patterns)
- "pool_tile"       → pool tiles / underwater mosaic
- "wallpaper"       → wallpaper / decorative wall paper
- "wall_cladding"   → wall cladding panels / 3D wall panels / wood wall panels
Product materials:
- "sanitary"           → faucets / mixers / bathtubs / showers / toilets / sinks / bidets
- "indoor_furniture"   → sofas / chairs / beds / wardrobes / tables / indoor home furniture (أثاث داخلي)
- "outdoor_furniture"  → patio furniture / garden chairs / umbrellas / artificial grass / outdoor products
- "decorative_rug"     → single area rug placed ON TOP of an existing floor
- "lighting"           → light fixtures / chandeliers / pendant lights / lamps
- "facade"             → facade cladding panels / exterior wall systems
Construction materials:
- "construction_material" → adhesive / grout / silicone / profiles / waterproofing / sealants
Generic fallback:
- "other"              → if none of the above categories match

Return ONLY valid JSON."""


MATERIAL_SUBTYPE_LABELS = {
    'carpet': 'wall-to-wall carpet (موكيت / broadloom)',
    'parquet': 'parquet wood flooring (باركيه خشبي)',
    'lvt_spc': 'LVT/SPC vinyl plank flooring',
    'rubber_flooring': 'rubber flooring (أرضيات مطاطية)',
    'ceramic_tile': 'ceramic/porcelain tile (سيراميك/بورسلان)',
    'porcelain_tile': 'decorative porcelain wall tile (بلاط ديكور جداري)',
    'mosaic': 'mosaic tile (موزاييك)',
    'pool_tile': 'pool tile (بلاط مسابح)',
    'marble': 'marble / natural stone slab (رخام وحجر طبيعي)',
    'natural_stone': 'natural stone (حجر طبيعي)',
    'glass_block': 'glass block (بلوك زجاج)',
    'wallpaper': 'wallpaper (ورق جداري)',
    'wall_cladding': 'wall cladding / leather wall panel (جدران جلدية / كلادينج)',
    'sanitary': 'sanitary ware (أدوات صحية — حنفيات / أحواض / بانيو)',
    'indoor_furniture': 'indoor furniture (أثاث داخلي)',
    'outdoor_furniture': 'outdoor furniture / artificial grass (جلسات خارجية / عشب صناعي)',
    'construction_material': 'construction material (غراء / تروبات / فواصل / مواد بناء)',
    'decorative_rug': 'decorative area rug (سجادة مفردة)',
    'other': 'building material product',
}


def _subtype_extra_guidance(material_subtype_hint: str) -> str:
    if material_subtype_hint == 'carpet':
        return (
            "\n\nFor this CARPET: describe pile type (loop pile / cut pile / berber / tufted), "
            "pile height (low/medium/high), exact color combination, pattern direction "
            "(horizontal/vertical stripes, geometric, solid), texture appearance (dense, plush, ribbed). "
            "Example: 'commercial loop-pile carpet in dark charcoal and black tones with "
            "subtle thin horizontal stripe pattern, medium-low pile height, dense woven texture'"
        )
    if material_subtype_hint in ('parquet', 'lvt_spc'):
        return (
            "\n\nFor this FLOORING: describe wood/material tone, grain pattern, plank width (narrow/wide), "
            "surface finish (matte/gloss/satin/oiled), plank length, and any visible texture details."
        )
    if material_subtype_hint == 'rubber_flooring':
        return (
            "\n\nFor this RUBBER FLOORING: describe base color, texture pattern (smooth/ribbed/coin/diamond), "
            "surface finish, and overall material appearance."
        )
    if material_subtype_hint in ('marble', 'natural_stone'):
        return (
            "\n\nFor this STONE: describe base color, veining color and direction, "
            "polish level (polished/honed/brushed), and any distinctive visual features."
        )
    if material_subtype_hint in ('ceramic_tile', 'porcelain_tile', 'mosaic'):
        return (
            "\n\nFor this TILE: describe base color, surface pattern (if any), gloss level "
            "(matte/semi-gloss/polished/lappato), tile format/size, and any decorative features."
        )
    if material_subtype_hint == 'glass_block':
        return (
            "\n\nFor this GLASS BLOCK: describe color (clear/frosted/tinted), "
            "surface texture (smooth/ribbed/patterned), transparency level, and approximate size."
        )
    if material_subtype_hint in ('wallpaper', 'wall_cladding'):
        return (
            "\n\nFor this WALL COVERING: describe base color, pattern/texture (3D relief, printed, "
            "geometric, floral, abstract), material appearance (fabric-look, stone-look, wood-look), "
            "and overall visual style."
        )
    if material_subtype_hint == 'sanitary':
        return (
            "\n\nFor this SANITARY WARE: describe the product type (faucet/mixer/shower/toilet/bathtub), "
            "finish (chrome/matte black/brushed gold/white ceramic), shape style (modern/classic), "
            "and key design features."
        )
    if material_subtype_hint in ('indoor_furniture', 'outdoor_furniture'):
        return (
            "\n\nFor this FURNITURE: describe material (fabric/leather/wood/metal/rattan), "
            "dominant color, style (modern/classic/industrial/rustic), key design features, "
            "and overall scale/dimensions impression."
        )
    return ''


def build_focused_analysis_prompt(material_subtype_hint: str, generation_mode_hint: str) -> str:
    """Create a focused analysis prompt when the user has pre-selected the product type."""
    mat_label = MATERIAL_SUBTYPE_LABELS.get(material_subtype_hint, material_subtype_hint)

    if generation_mode_hint == 'showcase':
        placement, category = 'studio', 'construction'
    elif generation_mode_hint == 'product':
        if material_subtype_hint == 'sanitary':
            placement, category = 'bathroom', 'sanitary'
        elif material_subtype_hint == 'outdoor_furniture':
            placement, category = 'outdoor', 'outdoor'
        elif material_subtype_hint == 'indoor_furniture':
            placement, category = 'living_room', 'furniture'
        else:
            placement, category = 'living_room', 'furniture'
    else:
        if material_subtype_hint in ('wallpaper', 'wall_cladding', 'glass_block', 'porcelain_tile'):
            placement, category = 'wall', 'wall_covering'
        else:
            placement, category = 'floor', 'flooring'

    extra = _subtype_extra_guidance(material_subtype_hint)

    return f"""The user has pre-selected this product type: {mat_label}
Generation mode: "{generation_mode_hint}"

Analyze this product image and extract ONLY the visual description details. Do NOT reclassify — the type is already determined.

Return a JSON object with exactly these fields:

1. product_type: نوع المنتج بالعربي
2. product_type_en: "{mat_label}"
3. color: اللون بالعربي — كن محدداً جداً
4. color_en: Exact color in English — be highly specific (e.g. "deep charcoal with thin dark blue stripe accents")
5. pattern: النمط بالعربي (إن وجد)
6. pattern_en: Pattern in English (e.g. "horizontal stripes", "geometric", "solid", "marble veining")
7. surface: نوع السطح / الملمس بالعربي
8. surface_en: Surface finish in English (e.g. "matte", "polished", "loop pile", "ribbed")
9. description_en: EXTREMELY DETAILED English description for AI image generation. This drives generation quality.
   Describe: exact colors, texture details, pattern specifics, surface finish, material characteristics, and unique visual features.{extra}
10. generation_mode: "{generation_mode_hint}"
11. recommended_placement: "{placement}"
12. product_category: "{category}"
13. material_subtype: "{material_subtype_hint}"

Return ONLY valid JSON."""


def analyze_product_image(image_url: str, material_subtype_hint: str = '', generation_mode_hint: str = '') -> dict:
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    logger.info(f"Analyzing product image with OpenAI Vision: {image_url[:80]}...")

    if material_subtype_hint and generation_mode_hint:
        prompt_text = build_focused_analysis_prompt(material_subtype_hint, generation_mode_hint)
        logger.info(f"Using focused analysis prompt: subtype={material_subtype_hint}, mode={generation_mode_hint}")
    else:
        prompt_text = VISION_ANALYSIS_PROMPT

    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[
            {'role': 'system', 'content': VISION_ANALYSIS_SYSTEM},
            {
                'role': 'user',
                'content': [
                    {'type': 'text', 'text': prompt_text},
                    {'type': 'image_url', 'image_url': {'url': image_url, 'detail': 'low'}},
                ],
            },
        ],
        temperature=0.2,
        max_tokens=500,
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1] if '\n' in raw else raw[3:]
        if raw.endswith('```'):
            raw = raw[:-3]
        raw = raw.strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse vision analysis JSON: {raw}")
        result = {
            'product_type': 'غير محدد',
            'product_type_en': 'Unknown',
            'color': 'غير محدد',
            'color_en': 'Unknown',
            'pattern': 'غير محدد',
            'pattern_en': 'Unknown',
            'surface': 'غير محدد',
            'surface_en': 'Unknown',
            'description_en': raw[:200],
        }

    # Enforce hint values — always override AI classification when user pre-selected
    if material_subtype_hint:
        result['material_subtype'] = material_subtype_hint
    if generation_mode_hint:
        result['generation_mode'] = generation_mode_hint
        if generation_mode_hint == 'showcase':
            result['recommended_placement'] = 'studio'
            result['product_category'] = 'construction'
        elif generation_mode_hint == 'product':
            if material_subtype_hint == 'sanitary':
                result['recommended_placement'] = 'bathroom'
                result['product_category'] = 'sanitary'
            elif material_subtype_hint == 'outdoor_furniture':
                result['recommended_placement'] = 'outdoor'
                result['product_category'] = 'outdoor'
            elif material_subtype_hint == 'indoor_furniture':
                result['recommended_placement'] = 'living_room'
                result['product_category'] = 'furniture'
            else:
                result.setdefault('recommended_placement', 'living_room')
        elif generation_mode_hint == 'surface':
            if material_subtype_hint in ('wallpaper', 'wall_cladding', 'glass_block', 'porcelain_tile'):
                result['recommended_placement'] = 'wall'
                result['product_category'] = 'wall_covering'
            else:
                result['recommended_placement'] = 'floor'
                result['product_category'] = 'flooring'

    # Fallback defaults for any missing fields (no-hint path)
    if 'generation_mode' not in result:
        result['generation_mode'] = 'surface'
    if 'recommended_placement' not in result:
        result['recommended_placement'] = 'floor'
    if 'product_category' not in result:
        result['product_category'] = 'flooring'
    if 'material_subtype' not in result:
        mode = result.get('generation_mode', 'surface')
        category = result.get('product_category', 'flooring')
        if mode == 'showcase':
            result['material_subtype'] = 'construction_material'
        elif mode == 'product':
            if category == 'sanitary':
                result['material_subtype'] = 'sanitary'
            elif category == 'outdoor':
                result['material_subtype'] = 'outdoor_furniture'
            else:
                result['material_subtype'] = 'other'
        else:
            if category == 'flooring':
                result['material_subtype'] = 'ceramic_tile'
            elif category == 'wall_covering':
                result['material_subtype'] = 'wall_cladding'
            else:
                result['material_subtype'] = 'other'

    return result

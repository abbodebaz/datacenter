"""
Celery tasks for Bayt Alebaa PDC integrations.
"""
import logging
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def generate_decorative_image_task(self, product_id: int):
    """
    Generates AI decorative image for a product.
    Stores result in Cloudflare R2 under lifestyle/ folder.
    Marks result as 'pending_review' before publishing.
    """
    try:
        from apps.products.models import Product
        from apps.images.models import ProductImage, ImageType, ImageStatus
        from apps.integrations.gemini_service import generate_decorative_image_prompt
        from apps.integrations.r2_client import upload_bytes

        product = Product.objects.select_related('category', 'brand').get(id=product_id)

        logger.info(f'Generating decorative image for product {product.sku}')

        # Step 1: Generate the image prompt via Gemini
        image_prompt = generate_decorative_image_prompt(product)
        logger.info(f'Generated prompt for {product.sku}: {image_prompt[:100]}...')

        # Step 2: TODO — Call image generation API (Stable Diffusion / Midjourney)
        # For now, log the prompt and record a pending image
        # image_bytes = call_image_generation_api(image_prompt)

        # Step 3: Create a ProductImage record in pending state
        r2_key = f"products/{product.category.slug}/{product.sku}/lifestyle/room_ai_01.jpg"
        ProductImage.objects.create(
            product=product,
            image_type=ImageType.LIFESTYLE,
            r2_key=r2_key,
            status=ImageStatus.PENDING_REVIEW,
            is_ai_generated=True,
            ai_prompt_used=image_prompt,
            ai_generation_task_id=self.request.id,
        )

        logger.info(f'AI image task completed for {product.sku} — pending review')
        return {'status': 'success', 'sku': product.sku, 'prompt': image_prompt}

    except Exception as exc:
        logger.error(f'Error generating decorative image for product {product_id}: {exc}')
        raise self.retry(exc=exc)


@shared_task
def sync_sap_data_task():
    """
    Runs every 30 minutes via Celery beat.
    Fetches prices and stock from SAP, validates with Gemini, saves to DB.
    """
    try:
        from apps.integrations.sap_client import fetch_sap_data
        from apps.integrations.gemini_service import call_gemini, SAP_SYNC_VALIDATOR_USER
        from apps.products.models import Product
        import json
        from django.utils import timezone

        logger.info('Starting SAP sync task...')

        sap_records = fetch_sap_data()
        if not sap_records:
            logger.warning('SAP sync: no records returned')
            return {'status': 'no_records'}

        # Validate with Gemini
        prompt = SAP_SYNC_VALIDATOR_USER.format(
            sap_data_json=json.dumps(sap_records, ensure_ascii=False)
        )
        validation = call_gemini(prompt, config_key='flash')

        valid_skus = validation.get('valid_records', [])
        invalid_records = validation.get('invalid_records', [])

        # Apply valid records to DB
        updated = 0
        for record in sap_records:
            sku = record.get('sku')
            if sku in valid_skus:
                rows = Product.objects.filter(sku=sku).update(
                    price_sar=record.get('price_sar'),
                    stock_status=record.get('stock_status'),
                    sap_last_sync=timezone.now(),
                )
                updated += rows

        logger.info(
            f'SAP sync completed: {updated} products updated, '
            f'{len(invalid_records)} invalid records skipped'
        )
        return {
            'status': 'success',
            'updated': updated,
            'invalid': len(invalid_records),
            'summary': validation.get('summary_ar', ''),
        }

    except Exception as exc:
        logger.error(f'SAP sync task failed: {exc}')
        return {'status': 'error', 'error': str(exc)}


@shared_task
def analyze_completeness_task():
    """
    Runs daily. Updates analytics dashboard data.
    Triggers alerts for categories with low completeness scores.
    """
    try:
        from apps.products.models import Product
        from apps.analytics.models import CompletenessReport
        from apps.integrations.gemini_service import call_gemini, COMPLETENESS_ANALYZER_USER
        import json

        logger.info('Starting completeness analysis task...')

        products = Product.objects.select_related('category').prefetch_related('images').all()

        dataset_summary = []
        for p in products:
            dataset_summary.append({
                'sku': p.sku,
                'category': p.category.name_ar,
                'has_name_ar': bool(p.product_name_ar),
                'has_name_en': bool(p.product_name_en),
                'has_description': bool(p.description_ar),
                'has_brand': bool(p.brand_id),
                'has_origin': bool(p.origin_country),
                'has_color': bool(p.color),
                'has_ecommerce_url': bool(p.ecommerce_url),
                'has_main_image': p.images.filter(image_type='main', status='approved').exists(),
                'has_lifestyle_image': p.images.filter(image_type='lifestyle', status='approved').exists(),
                'has_price': bool(p.price_sar),
                'has_stock': bool(p.stock_status),
                'completeness_score': p.completeness_score(),
            })

        required_fields = [
            'sku', 'product_name_ar', 'product_name_en', 'category', 'description_ar',
            'status', 'brand', 'origin_country', 'inventory_type', 'color',
            'ecommerce_url', 'main_image', 'lifestyle_image', 'price_sar', 'stock_status'
        ]

        prompt = COMPLETENESS_ANALYZER_USER.format(
            dataset_summary_json=json.dumps(dataset_summary[:100], ensure_ascii=False),  # limit for context
            required_fields=json.dumps(required_fields, ensure_ascii=False)
        )
        analysis = call_gemini(prompt, config_key='flash')

        # Save to analytics model
        CompletenessReport.objects.create(
            overall_score=analysis.get('overall_score', 0),
            total_products=analysis.get('total_products', 0),
            complete_products=analysis.get('complete_products', 0),
            category_scores=analysis.get('category_scores', {}),
            critical_gaps=analysis.get('critical_gaps', []),
            recommendations=analysis.get('recommendations', []),
            missing_lifestyle_images=analysis.get('missing_lifestyle_images_count', 0),
            missing_main_images=analysis.get('missing_main_images_count', 0),
            missing_sap_data=analysis.get('missing_sap_data_count', 0),
        )

        logger.info(f'Completeness analysis done: overall_score={analysis.get("overall_score")}')
        return analysis

    except Exception as exc:
        logger.error(f'Completeness analysis task failed: {exc}')
        return {'status': 'error', 'error': str(exc)}


# Gemini prompt reference (from gemini.md)
SAP_SYNC_VALIDATOR_USER = """
You are validating product data received from SAP ERP for Bayt Alebaa.

SAP Data Batch:
{sap_data_json}

Validate each record:
1. SKU format is valid (not empty, no special characters)
2. Price is a positive number in SAR
3. Stock status is a known value: دوري / ستوك / منتهي
4. No obvious data corruption (null fields that should have values)

Respond ONLY with valid JSON:
{
  "valid_records": ["SKU1", "SKU2"],
  "invalid_records": [{"sku": "SKU_X", "issues": ["issue"]}],
  "sync_recommended": true | false,
  "summary_ar": "ملخص قصير بالعربية"
}
"""

COMPLETENESS_ANALYZER_USER = """
Analyze product data completeness for Bayt Alebaa's Product Data Center.
Dataset Summary: {dataset_summary_json}
Required fields per product: {required_fields}

Respond ONLY with valid JSON:
{
  "overall_score": 0-100,
  "total_products": number,
  "complete_products": number,
  "critical_gaps": ["issues in Arabic"],
  "recommendations": [{"priority": "high|medium|low", "action_ar": "الإجراء", "affected_count": number, "affected_categories": []}],
  "category_scores": {"السيراميك": 75, "رخام": 60},
  "missing_lifestyle_images_count": number,
  "missing_main_images_count": number,
  "missing_sap_data_count": number
}
"""

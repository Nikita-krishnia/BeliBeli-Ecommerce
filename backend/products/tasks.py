import json
import requests
import logging
import numpy as np
from io import BytesIO
from PIL import Image
from celery import shared_task
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

print("Loading CLIP model into Celery worker memory...")
CLIP_MODEL = SentenceTransformer('clip-ViT-B-32')
print("CLIP model loaded in worker.")


@shared_task
def generate_image_vector(product_id):
    from .models import Product
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return

    if not product.image or product.image_vector:
        return

    try:
        response = requests.get(product.image.url)
        img = Image.open(BytesIO(response.content))
        vector = CLIP_MODEL.encode(img)
        product.image_vector = json.dumps(vector.tolist())
        Product.objects.filter(id=product.id).update(image_vector=product.image_vector)
        print(f"Vector generated for '{product.title}'")
    except Exception as e:
        print(f"Vector generation failed for '{product.title}': {str(e)}")


@shared_task(bind=True)
def perform_visual_search(self, image_base64):
    """Async task for visual product search - CLIP model already preloaded in worker"""
    from base64 import b64decode
    from .models import Product, SearchConfiguration
    
    try:
        # Decode image from base64
        image_data = b64decode(image_base64)
        user_img = Image.open(BytesIO(image_data))
        
        # CLIP model is already loaded - encode image instantly
        user_vector = CLIP_MODEL.encode(user_img)
        
        # Category detection using text anchors
        category_anchors = ["clothing", "shoes", "sunglasses", "hats"]
        text_embeddings = CLIP_MODEL.encode(category_anchors)
        scores = [np.dot(user_vector, text_emb) / (np.linalg.norm(user_vector) * np.linalg.norm(text_emb)) 
                  for text_emb in text_embeddings]
        predicted_domain = category_anchors[np.argmax(scores)]
        
        logger.info(f"[Visual Search] Predicted domain: {predicted_domain}")
        
        # Get active threshold from SearchConfiguration
        config = SearchConfiguration.objects.filter(is_active=True).first()
        active_threshold = config.confidence_threshold if config else 0.68
        
        # Search through all products
        products = Product.objects.all()
        match_results = []
        
        for p in products:
            if not p.image_vector:
                continue
                
            try:
                parsed_vector = json.loads(p.image_vector)
                if not parsed_vector:
                    continue
                    
                catalog_vector = np.array(parsed_vector)
                if user_vector.shape != catalog_vector.shape:
                    continue
                
                # Cosine similarity calculation
                dot_product = np.dot(user_vector, catalog_vector)
                norm_user = np.linalg.norm(user_vector)
                norm_catalog = np.linalg.norm(catalog_vector)
                
                if norm_user == 0 or norm_catalog == 0:
                    continue
                
                similarity = dot_product / (norm_user * norm_catalog)
                product_cat_lower = p.category.lower()
                
                # Domain matching filter
                is_domain_match = (
                    (predicted_domain == "shoes" and "shoe" in product_cat_lower) or
                    (predicted_domain == "clothing" and ("shirt" in product_cat_lower or "clothing" in product_cat_lower)) or
                    (predicted_domain == "sunglasses" and "glass" in product_cat_lower) or
                    (predicted_domain == "hats" and "hat" in product_cat_lower)
                )
                
                # Apply filtering rules
                if similarity >= active_threshold and (is_domain_match or similarity >= 0.80):
                    match_results.append({
                        "id": p.id,
                        "title": p.title,
                        "price": p.price,
                        "oldPrice": p.old_price,
                        "image": p.image.url if p.image else "",
                        "rating": p.rating,
                        "soldCount": p.sold_count,
                        "category": p.category,
                        "matchScore": round(float(similarity) * 100, 2)
                    })
                    
            except Exception as e:
                logger.warning(f"[Visual Search] Skipping product {p.title}: {e}")
                continue
        
        # Sort by match score and return top 5
        match_results.sort(key=lambda x: x["matchScore"], reverse=True)
        
        return {
            "status": "success",
            "results": match_results[:5]
        }
        
    except Exception as e:
        logger.error(f"[Visual Search] Task failed: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
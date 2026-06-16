import json
import requests
from io import BytesIO
from PIL import Image
from celery import shared_task
from sentence_transformers import SentenceTransformer

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
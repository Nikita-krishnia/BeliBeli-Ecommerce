from django.core.management.base import BaseCommand
from products.models import Product
from sentence_transformers import SentenceTransformer
from PIL import Image
from io import BytesIO
import requests
import json


class Command(BaseCommand):
    help = "Generate image_vector for any product missing one"

    def handle(self, *args, **options):
        model = SentenceTransformer('clip-ViT-B-32')

        for product in Product.objects.all():
            if not product.image or product.image_vector:
                continue
            try:
                response = requests.get(product.image.url)
                img = Image.open(BytesIO(response.content))
                vector = model.encode(img)
                product.image_vector = json.dumps(vector.tolist())
                product.save(update_fields=['image_vector'])
                self.stdout.write(self.style.SUCCESS(f"Vector generated for '{product.title}'"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Failed for '{product.title}': {str(e)}"))
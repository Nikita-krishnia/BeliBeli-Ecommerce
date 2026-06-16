import os
from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from products.models import Product


class Command(BaseCommand):
    help = "Push local product images to Cloudinary and update DB paths"

    def handle(self, *args, **options):
        for product in Product.objects.all():
            if not product.image:
                self.stdout.write(f"Skipping {product.title} - no image set")
                continue

            local_path = os.path.join(settings.MEDIA_ROOT, str(product.image))

            if not os.path.exists(local_path):
                self.stdout.write(self.style.WARNING(
                    f"Missing local file for '{product.title}': {local_path}"
                ))
                continue

            filename = os.path.basename(local_path)
            with open(local_path, 'rb') as f:
                product.image.save(filename, File(f), save=True)

            self.stdout.write(self.style.SUCCESS(
                f"Uploaded '{product.title}' -> {product.image.url}"
            ))
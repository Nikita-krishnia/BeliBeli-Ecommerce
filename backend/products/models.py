from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import json
from PIL import Image
import requests
from io import BytesIO


class Product(models.Model):
    SALE_TYPE_CHOICES = [
        ('flash_sale', 'Flash Sale Only'),
        ('todays_for_you', 'Todays For You Only'),
        ('both', 'Both Sections'),
    ]

    title = models.CharField(max_length=255)
    price = models.CharField(max_length=50)
    old_price = models.CharField(max_length=50)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    category = models.CharField(max_length=100, default="General")
    sale_type = models.CharField(max_length=20, choices=SALE_TYPE_CHOICES, default='todays_for_you')
    rating = models.FloatField(default=4.5)
    sold_count = models.CharField(max_length=50, default="0")
    image_vector = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"[{self.get_sale_type_display()}] - {self.title}"
        

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product') 

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"
    

class UserCategoryPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='category_preferences')
    category = models.CharField(max_length=100)
    view_count = models.PositiveIntegerField(default=0)
    last_viewed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'category')

    def __str__(self):
        return f"{self.user.username} - {self.category} ({self.view_count} views)"
    

@receiver(post_save, sender=Product)
def auto_generate_product_vector(sender, instance, created, **kwargs):
    """Automatically generates an image vector fingerprint when a product is saved"""
    if instance.image and not instance.image_vector:
        try:
            from sentence_transformers import SentenceTransformer

            model = SentenceTransformer('clip-ViT-B-32')

            response = requests.get(instance.image.url)
            img = Image.open(BytesIO(response.content))
            vector = model.encode(img)

            instance.image_vector = json.dumps(vector.tolist())
            Product.objects.filter(id=instance.id).update(image_vector=instance.image_vector)
            print(f"Signal: Generated vector automatically for '{instance.title}'")
        except Exception as e:
            print(f"Automatic vector generation failed for {instance.title}: {str(e)}")

            
class SearchConfiguration(models.Model):
    confidence_threshold = models.FloatField(
        default=0.68, 
        help_text="Minimum cosine similarity score (0.0 to 1.0) required for a visual match. Default is 0.68."
    )
    is_active = models.BooleanField(
        default=True, 
        help_text="Enable this row configuration to control the live search matching threshold parameters."
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Search Configuration"
        verbose_name_plural = "Search Configurations"

    def __str__(self):
        return f"Active Configuration Threshold: {self.confidence_threshold} (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
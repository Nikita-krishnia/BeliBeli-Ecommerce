from django.db import models
from django.contrib.auth.models import User

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
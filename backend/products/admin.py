from django.contrib import admin
from .models import Product, Wishlist, SearchConfiguration

# Register your models here

@admin.register(SearchConfiguration)
class SearchConfigurationAdmin(admin.ModelAdmin):
    list_display = ('confidence_threshold', 'is_active', 'updated_at')
    list_filter = ('is_active',)

admin.site.register(Product)
admin.site.register(Wishlist)
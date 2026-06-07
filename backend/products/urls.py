from django.urls import path
from .views import flash_sale_list,dynamic_category_list,todays_for_you_list,product_detail_api
from . import views

urlpatterns = [
    path('api/products/', flash_sale_list, name='flash-sale-list'),
    path('api/products/todays-for-you/', todays_for_you_list, name='todays-for-you'),
    path('api/categories/', dynamic_category_list, name='dynamic-categories'),
    path('api/products/<int:product_id>/', product_detail_api, name='product-detail-api'),
    path('api/products/wishlist/toggle/', views.toggle_wishlist, name='toggle_wishlist'),
    path('api/products/wishlist/', views.get_user_wishlist, name='get_user_wishlist'),
]

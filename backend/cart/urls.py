from django.urls import path
from .views import get_user_cart, add_to_cart, remove_from_cart,place_order,get_user_orders

urlpatterns = [
    path('api/cart/', get_user_cart, name='get-cart'),
    path('api/cart/add/', add_to_cart, name='add-to-cart'),
    path('api/cart/delete/<int:item_id>/', remove_from_cart, name='remove-from-cart'),
    path('api/cart/checkout/',place_order,name='place-order'),
    path('api/orders/history/', get_user_orders, name='order-history'),
]
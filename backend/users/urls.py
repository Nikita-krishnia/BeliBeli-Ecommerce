from django.urls import path
from . import views
from cart import views as cart_views

urlpatterns = [
   path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('orders/', cart_views.get_user_orders, name='user_orders'),
]
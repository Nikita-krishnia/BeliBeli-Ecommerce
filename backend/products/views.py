from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Product, Wishlist
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes


@api_view(['GET'])
def flash_sale_list(request):
    products = Product.objects.filter(sale_type__in=['flash_sale', 'both'])    
    
    # Grab wishlisted IDs if user is logged in
    user_wishlist_ids = []
    if request.user.is_authenticated:
        user_wishlist_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)
        
    data = []
    for p in products:
        image_path = p.image.url if p.image else ""
        if image_path and not image_path.startswith('http'):
            image_path = f"http://127.0.0.1:8000{image_path}"

        data.append({
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "oldPrice": p.old_price,
            "rating": p.rating,
            "soldCount": p.sold_count,
            "category": p.category,
            "image": image_path,
            "isWishlisted": p.id in user_wishlist_ids 
        })
        
    return JsonResponse(data, safe=False)


@api_view(['GET'])
def todays_for_you_list(request):
    products = Product.objects.all()
    
    user_wishlist_ids = []
    if request.user.is_authenticated:
        user_wishlist_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)

    products_data = []
    for product in products:
        image_path = product.image.url if product.image else ""
        if image_path and not image_path.startswith('http'):
            image_path = f"http://127.0.0.1:8000{image_path}"

        products_data.append({
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "oldPrice": product.old_price,
            "image": image_path,
            "rating": product.rating,
            "soldCount": product.sold_count,
            "isWishlisted": product.id in user_wishlist_ids 
        })

    return JsonResponse(products_data, safe=False)


def dynamic_category_list(request):
    unique_categories = Product.objects.exclude(category="").values_list('category', flat=True).distinct()
    categories_list = list(unique_categories)
    return JsonResponse(categories_list, safe=False)


@api_view(['GET']) # Added decorator for token tracking consistency
def product_detail_api(request, product_id):
    """Fetches a single unique product record based on its database primary key ID"""
    product = get_object_or_404(Product, id=product_id)
    
    user_wishlist_ids = []
    if request.user.is_authenticated:
        user_wishlist_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)

    image_path = product.image.url if product.image else ""
    if image_path and not image_path.startswith('http'):
        image_path = f"http://127.0.0.1:8000{image_path}"

    data = {
        "id": product.id,
        "title": product.title,
        "price": product.price,
        "oldPrice": product.old_price,
        "rating": product.rating,
        "soldCount": product.sold_count,
        "category": product.category,
        "image": image_path,
        "isWishlisted": product.id in user_wishlist_ids
    }
    return JsonResponse(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request):
    try:
        body = json.loads(request.body)
        product_id = body.get('productId')
        product = Product.objects.get(id=product_id)
        
        wishlist_item = Wishlist.objects.filter(user=request.user, product=product).first()
        
        if wishlist_item:
            wishlist_item.delete()
            is_wishlisted = False
            message = "Removed from wishlist"
        else:
            Wishlist.objects.create(user=request.user, product=product)
            is_wishlisted = True
            message = "Added to wishlist"
            
        return JsonResponse({
            "message": message,
            "isWishlisted": is_wishlisted
        }, status=200)
        
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_wishlist(request):
    """Fetch all products currently favorited by the logged-in user account"""
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related('product')
    
    wishlist_data = []
    for item in wishlist_items:
        product = item.product
        image_path = product.image.url if product.image else ""
        if image_path and not image_path.startswith('http'):
            image_path = f"http://127.0.0.1:8000{image_path}"

        wishlist_data.append({
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "oldPrice": product.old_price,
            "image": image_path,
            "rating": product.rating,
            "soldCount": product.sold_count,
            "isWishlisted": True 
        })

    return JsonResponse(wishlist_data, safe=False)
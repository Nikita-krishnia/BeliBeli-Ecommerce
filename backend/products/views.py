from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Product, Wishlist,UserCategoryPreference
import json
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes
from groq import Groq
import environ
import os
from rest_framework.decorators import parser_classes
from .models import Product
import logging


logger = logging.getLogger(__name__)


env = environ.Env()
environ.Env.read_env(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
client = Groq(api_key="")
client = Groq(api_key=env("GROQ_API_KEY"))


def get_absolute_image_url(image_field):
    if not image_field:
        return ""
    try:
        return image_field.url
    except Exception:
        return ""
    
  

@api_view(['GET'])
def flash_sale_list(request):
    products = Product.objects.filter(sale_type__in=['flash_sale', 'both'])    
    
    # Grab wishlisted IDs if user is logged in
    user_wishlist_ids = []
    if request.user.is_authenticated:
        user_wishlist_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)
        
    data = []
    for p in products:
        
        data.append({
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "oldPrice": p.old_price,
            "rating": p.rating,
            "soldCount": p.sold_count,
            "category": p.category,
            "image": get_absolute_image_url(p.image),
            "isWishlisted": p.id in user_wishlist_ids 
        })
        
    return JsonResponse(data, safe=False)


@api_view(['GET'])
def todays_for_you_list(request):
    products = Product.objects.all()
    
    user_wishlist_ids = []
    if request.user.is_authenticated:
        user_wishlist_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)


    favorite_categories = []
    if request.user.is_authenticated:
        favorite_categories = UserCategoryPreference.objects.filter(
            user=request.user, 
            view_count__gt=0
        ).order_by('-view_count').values_list('category', flat=True)

    all_products = list(products)
    if favorite_categories:
        # Sort the product list-items belonging to top categories float straight to the front
        def get_sort_priority(product):
            if product.category in favorite_categories:
                # Find its index position in the preference list (lower index = higher priority)
                return list(favorite_categories).index(product.category)
            return len(favorite_categories) + 1 # Push non-preferred categories to the back
            
        all_products.sort(key=get_sort_priority)


    products_data = []
    for product in all_products:


        products_data.append({
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "oldPrice": product.old_price,
            "image": get_absolute_image_url(product.image),
            "rating": product.rating,
            "soldCount": product.sold_count,
            "category": product.category,
            "isWishlisted": product.id in user_wishlist_ids 
        })

    return JsonResponse(products_data, safe=False)


def dynamic_category_list(request):
    unique_categories = Product.objects.exclude(category="").values_list('category', flat=True).distinct()
    categories_list = list(unique_categories)
    return JsonResponse(categories_list, safe=False)


@api_view(['GET']) 
def product_detail_api(request, product_id):
    """Fetches a single unique product record based on its database primary key ID"""
    product = get_object_or_404(Product, id=product_id)
    
    user_wishlist_ids = []
    if request.user.is_authenticated:
        user_wishlist_ids = Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True)

   

    data = {
        "id": product.id,
        "title": product.title,
        "price": product.price,
        "oldPrice": product.old_price,
        "rating": product.rating,
        "soldCount": product.sold_count,
        "category": product.category,
        "image": get_absolute_image_url(product.image),
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
       
        wishlist_data.append({
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "oldPrice": product.old_price,
            "image": get_absolute_image_url(product.image),
            "rating": product.rating,
            "soldCount": product.sold_count,
            "isWishlisted": True 
        })

    return JsonResponse(wishlist_data, safe=False)



@api_view(['POST'])
@permission_classes([AllowAny])
def ai_shopping_assistant(request):
    try:
        body = json.loads(request.body)
        user_message = body.get('message', '')
        chat_history = body.get('history', []) 

        all_products = Product.objects.all()
        catalog_summary = []
        for p in all_products:
            catalog_summary.append(f"- ID: {p.id}, Title: {p.title}, Price: {p.price}, Category: {p.category}")
        
        products_context = "\n".join(catalog_summary)

        system_prompt = f"""
        You are "BeliBeli Bot", a friendly, expert personal shopper and fashion stylist for the BeliBeli e-commerce store.
        Your goal is to help users find products, style outfits, and give recommendations.
        
        CRITICAL RULE: You can ONLY recommend products that exist in our official catalog below. Do NOT make up products.
        
        FORMAT RULE: When recommending a product, ALWAYS provide its title as a clickable Markdown link using this exact format:
        [Product Title](/product/PRODUCT_ID) - Price
        For example: "I recommend the [Men's Casual Shoes](/product/10) for Rs 850!"

        Here is our current live store inventory catalog:
        {products_context}
        
        Be concise, stylish, and direct in your recommendations.
        """

        messages = [{"role": "system", "content": system_prompt}]
        
        for msg in chat_history:
            messages.append({"role": msg['role'], "content": msg['content']})
            
        messages.append({"role": "user", "content": user_message})

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant", 
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        ai_response = completion.choices[0].message.content

        return JsonResponse({"reply": ai_response}, status=200)

    except Exception as e:
        # return JsonResponse({"error": str(e)}, status=400)
        print("!!! AI ASSISTANT ERROR LOG:", str(e))
        return JsonResponse({"error": str(e)}, status=400)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_category_view(request):
    try:
        body = json.loads(request.body)
        category = body.get('category', '').strip()
        
        if not category:
            return JsonResponse({"error": "Category is required"}, status=400)
            
        pref, created = UserCategoryPreference.objects.get_or_create(
            user=request.user,
            category=category
        )
        pref.view_count += 1
        pref.save()
        
        return JsonResponse({"message": "Preference tracked successfully"}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


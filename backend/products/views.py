from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Product, Wishlist,UserCategoryPreference
import json
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes
from groq import Groq
import environ
import os
from django.utils import timezone
import numpy as np
from PIL import Image
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from sentence_transformers import SentenceTransformer

env = environ.Env()
environ.Env.read_env(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
client = Groq(api_key="")
client = Groq(api_key=env("GROQ_API_KEY"))


print(" Loading CLIP Vision Engine into global system memory...")
GLOBAL_CLIP_MODEL = SentenceTransformer('clip-ViT-B-32')
print(" CLIP Engine successfully cached in RAM!")

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


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def visual_product_search(request):
    if 'image' not in request.FILES:
        return JsonResponse({"error": "No image file provided"}, status=400)
        
    try:
        uploaded_file = request.FILES['image']
        user_img = Image.open(uploaded_file)
        
        # 1. Generate the image vector embeddings vector
        user_vector = GLOBAL_CLIP_MODEL.encode(user_img)
        
        # ➔ 2. AI TEXT-ANCHOR MATCHING LAYER:
        # We find out what category domain this image belongs to using text anchors
        category_anchors = ["clothing", "shoes", "sunglasses", "hats"]
        
        # Encode these text categories into the same math space as the image
        text_embeddings = GLOBAL_CLIP_MODEL.encode(category_anchors)
        
        # Find which text anchor has the highest dot product with the user's image
        scores = [np.dot(user_vector, text_emb) / (np.linalg.norm(user_vector) * np.linalg.norm(text_emb)) for text_emb in text_embeddings]
        predicted_domain = category_anchors[np.argmax(scores)]
        
        print(f"AI Predicted Search Domain Category: {predicted_domain}")
        
        products = Product.objects.all()
        match_results = []
        
        for p in products:
            if not p.image_vector:
                continue
                
            try:
                # Basic parsing validations
                parsed_vector = json.loads(p.image_vector)
                if not parsed_vector:
                    continue
                    
                catalog_vector = np.array(parsed_vector)
                if user_vector.shape != catalog_vector.shape:
                    continue
                
                # Math Core: Cosine Similarity
                dot_product = np.dot(user_vector, catalog_vector)
                norm_user = np.linalg.norm(user_vector)
                norm_catalog = np.linalg.norm(catalog_vector)
                
                if norm_user == 0 or norm_catalog == 0:
                    continue
                    
                similarity = dot_product / (norm_user * norm_catalog)
                
                # ➔ 3. APPLY SMART DUAL FILTER LAYER:
                # Rule A: Must pass a strict baseline similarity index threshold (e.g., 68%)
                # Rule B: Protect domain bounds (If user uploaded clothing, do not show shoes!)
                product_cat_lower = p.category.lower()
                
                is_domain_match = (
                    (predicted_domain == "shoes" and "shoe" in product_cat_lower) or
                    (predicted_domain == "clothing" and ("shirt" in product_cat_lower or "clothing" in product_cat_lower)) or
                    (predicted_domain == "sunglasses" and "glass" in product_cat_lower) or
                    (predicted_domain == "hats" and "hat" in product_cat_lower)
                )
                
                # Fallback safeguard: If similarity is exceptionally high (>80%), let it through anyway
                if similarity >= 0.68 and (is_domain_match or similarity >= 0.80):
                    match_results.append((p, similarity))
                    
            except Exception as row_err:
                print(f"Skipping row error for {p.title}: {str(row_err)}")
                continue 
                
        # Sort results by match score descending
        match_results.sort(key=lambda x: x[1], reverse=True)
        top_matches = match_results[:5]
        
        search_data = []
        for product, score in top_matches:
            image_path = product.image.url if product.image else ""
            if image_path and not image_path.startswith('http'):
                image_path = f"http://127.0.0.1:8000{image_path}"
                
            search_data.append({
                "id": product.id,
                "title": product.title,
                "price": product.price,
                "oldPrice": product.old_price,
                "image": image_path,
                "rating": product.rating,
                "soldCount": product.sold_count,
                "category": product.category,
                "matchScore": round(float(score) * 100, 2)
            })
            
        return JsonResponse(search_data, safe=False, status=200)
        
    except Exception as e:
        print("!!! VISUAL SEARCH CRASH LOG:", str(e))
        return JsonResponse({"error": f"Visual search failed processing: {str(e)}"}, status=500)
    """
    Accepts an uploaded image file, generates its CLIP fingerprint,
    and returns top matching products using Cosine Similarity.
    """
    if 'image' not in request.FILES:
        return JsonResponse({"error": "No image file provided"}, status=400)
        
    try:
        uploaded_file = request.FILES['image']
        user_img = Image.open(uploaded_file)
        
        
        # model = SentenceTransformer('clip-ViT-B-32')
        user_vector = GLOBAL_CLIP_MODEL.encode(user_img)
        
        # Pull all products
        products = Product.objects.all()
        match_results = []
        
        for p in products:
            # ➔ CRITICAL FIX: Skip product if it has no vector text string at all
            if not p.image_vector:
                continue
                
            try:
                # Attempt to parse vector string
                parsed_vector = json.loads(p.image_vector)
                if not parsed_vector:
                    continue
                    
                catalog_vector = np.array(parsed_vector)
                
                # ➔ CRITICAL FIX: Validate that matrix vector shapes match exactly before doing dot product math
                if user_vector.shape != catalog_vector.shape:
                    continue
                
                # Calculate Cosine Similarity
                dot_product = np.dot(user_vector, catalog_vector)
                norm_user = np.linalg.norm(user_vector)
                norm_catalog = np.linalg.norm(catalog_vector)
                
                if norm_user == 0 or norm_catalog == 0:
                    continue
                    
                similarity = dot_product / (norm_user * norm_catalog)
                if similarity >= 0.48: 
                    match_results.append((p, similarity))
            except Exception as row_err:
                print(f"Skipping row error for {p.title}: {str(row_err)}")
                continue 
                
        # Sort by match score descending
        match_results.sort(key=lambda x: x[1], reverse=True)
        top_matches = match_results[:5]
        
        search_data = []
        for product, score in top_matches:
            image_path = product.image.url if product.image else ""
            if image_path and not image_path.startswith('http'):
                image_path = f"http://127.0.0.1:8000{image_path}"
                
            search_data.append({
                "id": product.id,
                "title": product.title,
                "price": product.price,
                "oldPrice": product.old_price,
                "image": image_path,
                "rating": product.rating,
                "soldCount": product.sold_count,
                "category": product.category,
                "matchScore": round(float(score) * 100, 2)
            })
            
        return JsonResponse(search_data, safe=False, status=200)
        
    except Exception as e:
        print("!!! VISUAL SEARCH CRASH LOG:", str(e)) # ➔ This will show up in your Django terminal window!
        return JsonResponse({"error": f"Visual search failed processing: {str(e)}"}, status=500)
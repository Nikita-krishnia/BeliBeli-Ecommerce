import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from products.models import Product
from .models import CartItem, OrderItem, Order

@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_user_cart(request):
    """Fetch all items inside the logged-in user's shopping cart"""
    items = CartItem.objects.filter(user=request.user)
    
    cart_data = []
    for item in items:
        image_path = item.product.image.url if item.product.image else ""
        if image_path and not image_path.startswith('http'):
            image_path = f"${API_BASE_URL}{image_path}"

        cart_data.append({
            "cartItemId": item.id,
            "productId": item.product.id,
            "title": item.product.title,
            "price": item.product.price,
            "quantity": item.quantity,
            "image": image_path
        })

    return JsonResponse(cart_data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    try:
        body = json.loads(request.body)
        product_id = body.get('productId')
        quantity = int(body.get('quantity', 1))
        
        product = Product.objects.get(id=product_id)
        
        # ➔ 3. Uses the true authenticated user
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
            
        return JsonResponse({"message": "Successfully updated bag items", "quantity": cart_item.quantity}, status=200)
        
    except Product.DoesNotExist:
        return JsonResponse({"error": "Product not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        # ➔ 4. Ensures users can ONLY delete items out of their own cart sheet row
        cart_item = CartItem.objects.get(id=item_id, user=request.user)
        cart_item.delete()
        return JsonResponse({"message": "Item dropped from bag"}, status=200)
    except CartItem.DoesNotExist:
        return JsonResponse({"error": "Item not found"}, status=404)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    try:
        body = json.loads(request.body)
        total_amount = body.get('total_amount', 'Rs0')
        
        # ➔ 5. Pulls cart items specifically belonging to the checkout candidate
        cart_items = CartItem.objects.filter(user=request.user)
        
        if not cart_items.exists():
            return JsonResponse({"error": "Cart is empty"}, status=400)
            
        # Create the Order assigned to the verified user
        order = Order.objects.create(user=request.user, total_amount=total_amount)
        
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            
        # Clear out the user's cart sheet completely upon successful checkout purchase
        cart_items.delete()
        
        return JsonResponse({
            "message": "Order placed successfully!",
            "orderId": order.id
        }, status=201)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_orders(request):
    """Fetch only the orders matching the verified user token session"""
    # ➔ 6. Secures historical order sheets from data leaks!
    orders = Order.objects.filter(user=request.user).order_by("-id")    
    
    history_data = []
    for order in orders:
        line_items = []
        for item in order.items.all():
            image_path = item.product.image.url if item.product.image else ""
            if image_path and not image_path.startswith('http'):
                image_path = f"${API_BASE_URL}{image_path}"

            line_items.append({
                "product_id": item.product.id,
                "title": item.product.title,
                "quantity": item.quantity,
                "price": item.price,
                "image": image_path
            })

        order_date_str = order.created_at.strftime("%B %d")

        history_data.append({
            "orderId": order.id,
            "totalAmount": order.total_amount,
            "orderDate": order_date_str,
            "status": order.status,
            "items": line_items
        })

    return JsonResponse(history_data, safe=False)
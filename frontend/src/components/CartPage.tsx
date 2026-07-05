import { Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import './CartPage.css';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function CartPage() {
    const navigate = useNavigate();
    
    const { cartItems, loading, removeFromCart } = useCart();

    const subtotal = cartItems.reduce((acc, item) => {
        const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
        return acc + (numericPrice * item.quantity);
    }, 0);

    const deliveryFee = subtotal > 0 ? 150 : 0; 
    const totalOrderCost = subtotal + deliveryFee;

    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to complete your purchase.");
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/checkout/`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}` 
                },
                body: JSON.stringify({ 
                    total_amount: `Rs ${totalOrderCost.toLocaleString()}` 
                })
            });

            const data = await response.json();

            if (response.ok && data.orderId) {
                navigate('/orders');
                window.location.reload();
            } else {
                alert(data.error || "Something went wrong during checkout.");
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            alert("Could not connect to checkout processing systems.");
        }
    };

    if (loading) return <div className="cart-loading">Loading your shopping bag...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="empty-cart-view">
                <h2>Your Bag is Empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="shop-now-btn">
                    <ArrowLeft size={16} /> Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <h1 className="cart-title">Shopping Bag ({cartItems.length} items)</h1>

            <div className="cart-layout">
                {/* LEFT- ITEM ENTRIES */}
                <div className="cart-items-list">
                    {cartItems.map((item) => {
                        const numericPrice = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
                        return (
                            <div key={item.cartItemId} className="cart-item-card">
                                <img src={item.image} alt={item.title} className="cart-item-img" />

                                <div className="cart-item-details">
                                    <h3 className="item-name">{item.title}</h3>
                                    <p className="item-unit-price">Unit Price: {item.price}</p>
                                    <p className="item-qty">Quantity: {item.quantity}</p>
                                </div>

                                <div className="cart-item-actions">
                                    <span className="item-total-line-price">
                                        Rs {(numericPrice * item.quantity).toLocaleString()}
                                    </span>
                                    <button
                                        className="remove-item-btn"
                                        onClick={() => removeFromCart(item.cartItemId)}
                                        aria-label="Delete item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT ORDER COST SUMMARY SIDEBAR */}
                <div className="order-summary-sidebar">
                    <div className="summary-card">
                        <h2>Order Summary</h2>
                        <hr />
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>Rs {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery Fee</span>
                            <span>Rs {deliveryFee}</span>
                        </div>
                        <hr />
                        <div className="summary-row total-row">
                            <span>Total Amount</span>
                            <span>Rs {totalOrderCost.toLocaleString()}</span>
                        </div>
                        
                        <button className="checkout-proceed-btn" onClick={handleCheckout}>
                            Proceed to Secure Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

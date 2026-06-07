import { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import './OrderPage.css';
import { useNavigate } from 'react-router-dom';

interface OrderItem {
    product_id: number;
    title: string;
    quantity: number;
    price: string;
    image: string;
}

interface OrderRecord {
    orderId: number;
    totalAmount: string;
    orderDate: string;
    status: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();

useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.warn("No token found in storage. Redirecting...");
                setLoading(false);
                return;
            }
            
            try {
                const response = await fetch('http://127.0.0.1:8000/api/users/orders/', { 
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}` 
                    }
                });

                if (!response.ok) {
                    console.error(`Server responded with status code: ${response.status}`);
                    if (response.status === 401) {
                        console.error("Token verification failed. Your token might be invalid or expired.");
                    }
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log("Successfully loaded user orders:", data);
                setOrders(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to connect to the backend server:", err);
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, []);
    if (loading) return <div className="history-loading">Fetching order logs...</div>;

    return (
        <div className="orders-history-container">
            <h1>Your Orders</h1>

            {orders.length === 0 ? (
                <p className="no-orders">You have not placed any orders yet.</p>
            ) : (
                <div className="orders-list-wrapper">
                    {orders.map((order) => (
                        <div key={order.orderId} className="order-card">

                            <div className="order-card-header">
                                <div className="meta-column">
                                    <span className="label">ORDER PLACED</span>
                                    <span className="value">{order.orderDate}</span>
                                </div>
                                <div className="meta-column">
                                    <span className="label">TOTAL</span>
                                    <span className="value">{order.totalAmount}</span>
                                </div>
                                <div className="meta-column id-column">
                                    <span className="label">ORDER ID</span>
                                    <span className="value">b2c-000{order.orderId}-87c5</span>
                                </div>
                            </div>

                            <div className="order-card-body">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="purchased-item-row">
                                        <img src={item.image} alt={item.title} className="purchased-img" />

                                        <div className="purchased-info">
                                            <h3>{item.title}</h3>
                                            <p className="arrival-notice">Status: <strong>{order.status}</strong></p>
                                            <p className="qty-mark">Quantity: {item.quantity}</p>

                                            <button
                                                className="re-buy-btn"
                                                onClick={() => {
                                                    addToCart(item.product_id);
                                                    alert(`Added another ${item.title} back to your shopping bag!`);
                                                }}
                                            >
                                                🛒 Add to Cart Again
                                            </button>
                                        </div>

                                        <div className="row-actions">
                                            <button
                                                className="track-btn"
                                                onClick={() => navigate(`/track/${order.orderId}`, { state: { status: order.status, date: order.orderDate } })}
                                            >
                                                Track package
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Truck, Package, CheckCircle, ShieldCheck } from 'lucide-react';
import './TrackOrder.css';

export default function TrackOrder() {
    const { orderId } = useParams<{ orderId: string }>();
    const location = useLocation();
    
    const orderStatus = location.state?.status || 'Processing';
    const orderDate = location.state?.date || 'Recent';

    const isShipped = orderStatus === 'Shipped' || orderStatus === 'Delivered';
    const isDelivered = orderStatus === 'Delivered';

    return (
        <div className="track-order-container">
            <div className="track-navigation-header">
                <Link to="/orders" className="back-to-orders-link">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>
            </div>

            <div className="tracking-summary-card">
                <div className="summary-left">
                    <h2>Track Shipment for Order #000{orderId}</h2>
                    <p>Placed on: <strong>{orderDate}</strong></p>
                </div>
                <div className="summary-right">
                    <span className={`status-badge ${orderStatus.toLowerCase()}`}>
                        {orderStatus}
                    </span>
                </div>
            </div>

            <div className="timeline-card">
                <div className="vertical-timeline">
                    
                    <div className="timeline-milestone completed">
                        <div className="milestone-icon">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="milestone-content">
                            <h3>Order Confirmed</h3>
                            <p>Your payment went through and the order has been logged into our orders</p>
                        </div>
                    </div>

                    {/*  Processing */}
                    <div className="timeline-milestone completed">
                        <div className="milestone-icon">
                            <Package size={20} />
                        </div>
                        <div className="milestone-content">
                            <h3>Item Packed & Prepared</h3>
                            <p>Our warehouse facility has picked your inventory products and boxed them securely.</p>
                        </div>
                    </div>

                    {/* Shipped */}
                    <div className={`timeline-milestone ${isShipped ? 'completed' : 'pending'}`}>
                        <div className="milestone-icon">
                            <Truck size={20} />
                        </div>
                        <div className="milestone-content">
                            <h3>In Transit (Shipped)</h3>
                            <p>Package has been handed off to our courier vehicle services partner network.</p>
                        </div>
                    </div>

                    {/*Delivered */}
                    <div className={`timeline-milestone ${isDelivered ? 'completed' : 'pending'}`}>
                        <div className="milestone-icon">
                            <CheckCircle size={20} />
                        </div>
                        <div className="milestone-content">
                            <h3>Delivered Successfully</h3>
                            <p>Item dropped at custome destination address.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

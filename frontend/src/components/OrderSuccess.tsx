import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar } from 'lucide-react';
import './OrderSuccess.css';

export default function OrderSuccess() {
    const location = useLocation();
    const { orderId} = location.state || { orderId: 'N/A', total: 0 };

    const today = new Date();
    const arrivalDate = new Date();
    arrivalDate.setDate(today.getDate() + 4);

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedArrivalDate = arrivalDate.toLocaleDateString('en-IN', options);

    return (
        <div className="order-success-page">
            <div className="success-header-card">
                <CheckCircle size={56} color="#10b981" className="success-icon" />
                <h1>Thank You for Your Purchase!</h1>
                <p className="order-number-sub">Your transaction went through perfectly. Order ID: <strong>#000{orderId}</strong></p>
            </div>

            <div className="delivery-tracking-panel">
                <h2><Truck size={20} /> Shipping Status Status Tracking</h2>
                <div className="estimated-date">
                    <Calendar size={18} />
                    <span>Estimated Date of Arrival: <strong>{formattedArrivalDate}</strong></span>
                </div>

                {/* VISUAL STEP PROGRESS BAR */}
                <div className="tracking-timeline">
                    <div className="timeline-step completed">
                        <div className="circle">✓</div>
                        <span>Order Placed</span>
                    </div>
                    <div className="timeline-step active">
                        <div className="circle"><Package size={14} /></div>
                        <span>Processing</span>
                    </div>
                    <div className="timeline-step future">
                        <div className="circle"></div>
                        <span>Out for Delivery</span>
                    </div>
                </div>
            </div>

            <div className="next-action-footer">
                <Link to="/" className="continue-shopping-btn">Return to Marketplace</Link>
            </div>
        </div>
    );
}
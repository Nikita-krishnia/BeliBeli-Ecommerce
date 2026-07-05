import './Header.css'
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { Heart} from 'lucide-react';



export default function Header() {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const totalWishlistCount = 0;

    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username') || 'User';

    const handleInputChange = (text: string) => {
        if (text.trim()) {
            navigate(`/?search=${encodeURIComponent(text.trim())}`);
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        alert('Logged out successfully.');
        navigate('/');
        window.location.reload();
    };

    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="header">
            <div className="upper-header">
                <div className="left-links">
                    <a href="#download" className="app-download">📱Download BeliBeli App</a>
                </div>
                <div className="right-links">
                    <a href="#mitra">Mitra BeliBeli</a>
                    <a href="#about">About BeliBeli</a>
                    <a href="#care">BeliBeli Care</a>
                    <a href="#promo">Promo</a>
                    <span className="divider">|</span>
                    {token ? (
                        <>
                            <span className="user-welcome-greet" style={{ fontWeight: 600, color: '#333' }}>
                                👋 Hi, {savedUsername}
                            </span>
                            <span className="divider">|</span>
                            <button onClick={handleLogout} className="logout-inline-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="auth">Sign Up</Link>
                            <span className="divider">|</span>
                            <Link to="/login" className="auth">Login</Link>
                        </>
                    )}

                </div>
            </div>

            <div className="main-navbar">

                <Link to="/" className="logo-container" style={{ textDecoration: "none" }}>
                    <img src="/logo.jpg" alt="BeliBeli Logo" className="logo-img" />
                    <span className="logo-text">BeliBeli.com</span>
                </Link>
                <div className="search-container">
                    <div className="search-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="🔍Search product or brand here..."
                            onChange={(e) => handleInputChange(e.target.value)}
                            className="search-input"
                            style={{ paddingRight: '45px', width: '100%' }}
                        />


                    </div>
                </div>

                <div className="navbar-last">

                    <Link to="/wishlist" className="wishlist-action-btn" aria-label="View Wishlist">
                        <Heart size={30} color="#333333" className="wishlist-icon-nav" />
                        {totalWishlistCount > 0 && (
                            <span className="wishlist-count-badge">{totalWishlistCount}</span>
                        )}
                    </Link>

                    <Link to="/cart" className="cart-action-btn" aria-label="Shopping Cart">
                        <img src="/icons/cart-dark.png" alt="Cart Icon" className="cart-img" />
                        {totalCartCount > 0 && (
                            <span className="cart-count">{totalCartCount}</span>
                        )}
                    </Link>

                    <Link to="/orders" className="orders-history-link" style={{ textDecoration: "none" }}>
                        Orders
                    </Link>
                </div>
            </div>

        </header>
    );
}

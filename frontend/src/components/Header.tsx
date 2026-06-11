import './Header.css'
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Camera } from 'lucide-react';
import VisualSearchModal from './VisualSearchModal';
import { useState, useRef } from 'react';


export default function Header() {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const totalWishlistCount = 0;

    const token = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username') || 'User';

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isVisualSearchOpen, setIsVisualSearchOpen] = useState<boolean>(false);

    const [visualSearchLoading, setVisualSearchLoading] = useState<boolean>(false);
    const [visualPreviewUrl, setVisualPreviewUrl] = useState<string>('');

    const handleCameraClick = () => {
        // Programmatically trigger a click on our hidden native file input node
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVisualSearchLoading(true);
            setSelectedImage(file);

            // ➔ Generate the URL string directly here in the user interaction event loop
            const url = URL.createObjectURL(file);
            setVisualPreviewUrl(url);

            setIsVisualSearchOpen(true);
            e.target.value = ""; // Clear file cache node
        }
    };
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

                        <button
                            type="button"
                            className="camera-search-btn"
                            onClick={handleCameraClick}
                            aria-label="Search by image"
                            style={{
                                background: 'none',
                                border: 'none',
                                position: 'absolute',
                                right: '15px',
                                cursor: 'pointer',
                                color: '#555555',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px'
                            }}
                        >
                            <Camera size={20} />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
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

            <VisualSearchModal
                isOpen={isVisualSearchOpen}
                onClose={() => {
                    setIsVisualSearchOpen(false);
                    setSelectedImage(null);
                    // ➔ Safe cleanup right when the modal window disappears
                    if (visualPreviewUrl) {
                        URL.revokeObjectURL(visualPreviewUrl);
                        setVisualPreviewUrl('');
                    }
                }}
                imageFile={selectedImage}
                previewUrl={visualPreviewUrl} 
                loading={visualSearchLoading}
                setLoading={setVisualSearchLoading}
            />
        </header>
    );
}
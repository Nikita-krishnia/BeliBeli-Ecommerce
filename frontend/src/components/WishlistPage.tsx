import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './WishlistPage.css';
import API_BASE_URL from '../config';
import Loader from './Loader';

interface Product {
    id: number;
    title: string;
    price: string;
    oldPrice?: string;
    rating?: number;
    soldCount?: string;
    image: string;
}

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/products/wishlist/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setWishlistItems(data);
                }
            } catch (err) {
                console.error("Failed to load wishlist entries:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <div className="wishlist-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div className="flash-products-container skeleton-row">                  {Array.from({ length: 6 }).map((_, i) => (
                    <Loader key={i} />
                ))}
                </div>
            </div>
        );
    }


    if (wishlistItems.length === 0) {
        return (
            <div className="empty-wishlist-view" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h2>Your Wishlist is Empty</h2>
                <p style={{ color: '#666', margin: '15px 0 25px' }}>Tap the heart icon on items you love to save them here!</p>
                <Link to="/" className="shop-now-btn" style={{ textDecoration: 'none', background: '#333', color: '#fff', padding: '10px 20px', borderRadius: '5px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={16} /> Explore Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 className="wishlist-title" style={{ fontSize: '2rem', marginBottom: '30px', fontWeight: 600 }}>Your Wishlist</h1>

            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                {wishlistItems.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

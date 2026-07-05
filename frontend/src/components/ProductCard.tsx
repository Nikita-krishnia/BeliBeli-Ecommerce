import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import './ProductCard.css';
import { useState} from 'react';
import API_BASE_URL from '../config';

interface ProductCardProps {
    product: {
        id: number;
        title: string;
        price: string;
        oldPrice?: string;
        rating?: number;
        soldCount?: string;
        image: string;
        category?: string;
        isWishlisted?: boolean; 
    };
}

export default function ProductCard({ product }: ProductCardProps) {
   const [isLiked, setIsLiked] = useState(product.isWishlisted || false);
    
    const [prevProductId, setPrevProductId] = useState(product.id);

    if (product.id !== prevProductId) {
        setPrevProductId(product.id);
        setIsLiked(product.isWishlisted || false);
    }

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to add items to your wishlist!");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/products/wishlist/toggle/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({ productId: product.id })
            });

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isWishlisted);
            }
        } catch (err) {
            console.error("Wishlist toggle failure:", err);
        }
    };

    return (
        <div className="common-product-card1">
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="common-image-wrapper1">
                    <img src={product.image} alt={product.title} className="img1" />
                    <button className="wishlist-btn1" onClick={handleWishlistToggle}>
                        <Heart size={16} color={isLiked ? "#ff4d4d" : "#333333"}
                            fill={isLiked ? "#ff4d4d" : "none"} />
                    </button>
                </div>

                <div className="product-info2">
                    <h3 className="common-title1">{product.title}</h3>

                    <div className="common-rating-container">
                        <Star size={14} fill="#ffb703" color="#ffb703" />
                        <span className="score">{product.rating}</span>
                        <span className="separator">•</span>
                        <span className="sold">{product.soldCount} Sold</span>
                    </div>

                    <div className="price-container">
                        <span className="current-price">{product.price}</span>
                        {product.oldPrice && (
                            <span className="old-price">{product.oldPrice}</span>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}

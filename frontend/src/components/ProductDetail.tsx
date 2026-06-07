import { useParams, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Star, ChevronRight } from 'lucide-react';
import './ProductDetail.css';

interface Product {
    id: number;
    title: string;
    price: string;
    oldPrice?: string;
    rating: number;
    soldCount: string;
    category: string;
    image: string;
}

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const { addToCart } = useCart();

    const [selectedSize, setSelectedSize] = useState('M');
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/products/${id}/`)
            .then((res) => {
                if (!res.ok) throw new Error('Product not found in database');
                return res.json();
            })
            .then((data: Product) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error connecting to Django database:', error);
                setProduct(null);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="product-loading">Loading item specifications...</div>;
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <h2>Oops! Product Not Found</h2>
                <Link to="/" className="back-btn">Return to Marketplace</Link>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <nav className="detail-nav">
                <Link to="/">Home</Link> <ChevronRight size={12} />
                <span className="current-crumb">{product.title}</span>
            </nav>

            <div className="main-product">
                <div className="show-other-angles">
                    <div className="diffrent-vertical-angles">
                        <img src={product.image} alt="angle1" className="angle-img active" />
                        <img src={product.image} alt="angle2" className="angle-img" />
                        <img src={product.image} alt="angle3" className="angle-img" />
                        <img src={product.image} alt="angle4" className="angle-img" />
                    </div>
                    <div className="featured-hero-image-frame">
                        <img src={product.image} alt="main look" className="Main-display-img" />
                    </div>
                </div>

                <div className="item-specification">
                    <h1 className="product-main-title">{product.title}</h1>

                    <div className="ratings-sales-summary-row">
                        <span className="sales-count">{product.soldCount} Sold</span>
                        <span className="divider-dot">•</span>
                        <div className="star-rating1">
                            {[...Array(5)].map((_, idx) => (
                                <Star key={idx} size={14} fill="#ffb703" color="#ffb703" />
                            ))}
                            <span className="score-text">{product.rating}</span>
                        </div>
                        <span className="divider-dot">•</span>
                        <span className="review-count">188 Reviews</span>
                    </div>

                    <div className="price-row">
                        <div className="current-row">{product.price}</div>
                        <div className="sale-section">
                            {product.oldPrice && <span className="old-price1">{product.oldPrice}</span>}
                            <span className="off-per">Discounted</span>
                        </div>
                    </div>

                    <div className="more-options-for-same">
                        <div className="selector-title-row">
                            <span className="label-heading">Select Size</span>
                            <button className="size-guide-modal-trigger">Size Guide</button>
                        </div>
                        <div className="chips-flex-container">
                            {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="buy-options">
                        <button className="buy-now">Buy this Item</button>
                        <button onClick={() => addToCart(product.id)} className="add-to-bag">Add to Bag</button>
                    </div>

                    <div className="chat-wishlist-share">
                        <button className="social"><MessageCircle size={16} /> Chat</button>
                        <button className="social"><Heart size={16} /> Wishlist</button>
                        <button className="social"><Share2 size={16} /> Share</button>
                    </div>

                </div>
            </div>

            <div className="detailed-specifications-tabs">
                <div className="tabs-header">
                    <button className="tabs active">Description</button>
                    <button className="tabs">Styling Ideas</button>
                    <button className="tabs">Review</button>
                    <button className="tabs">Best Seller</button>
                </div>

                <div className="tab-content-body">
                    <h2>Product Details</h2>
                    <p className="para-des">
                        This premium garment offers exceptional performance and versatility for casual everyday wear or active lifestyles. Crafted with advanced moisture-wicking materials and structural knit properties, it ensures absolute comfort while maintaining high breathability throughout long days under shifting climates.
                    </p>
                </div>
            </div>
        </div>
    );
}
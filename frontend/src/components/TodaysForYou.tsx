import { useState, useEffect } from "react";
import './TodaysForYou.css';
import ProductCard from "./ProductCard";
import API_BASE_URL from '../config';
import Loader from './Loader';

interface Product {
    id: number;
    title: string;
    rating: number;
    soldCount: string;
    price: string;
    oldPrice?: string;
    image: string;
    category: string;
}

interface TodaysForYouProps {
    selectedCategory: string;
    searchQuery: string;
}

export default function TodaysForYou({ selectedCategory, searchQuery }: TodaysForYouProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Token ${token}`;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/todays-for-you/`, {
                    method: 'GET',
                    headers: headers
                });
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                }
            }
            catch (error) {
                console.error('Error fetching Todays For You data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);


    const filteredProducts = products.filter((product) => {
        if (searchQuery && searchQuery.trim() !== "") {
            return product.title.toLowerCase().includes(searchQuery.toLowerCase());
        }

        if (selectedCategory.toLowerCase() === 'all' || selectedCategory.toLowerCase() === 'all category') {
            return true;
        }
        return product.category.toLowerCase() === selectedCategory.toLowerCase();
    });


    if (loading) {
        return (
            <section className="flash-sale-section">
                <div className="flash-products-container skeleton-row">                        {Array.from({ length: 6 }).map((_, i) => (
                    <Loader key={i} />
                ))}
                </div>
            </section>
        );
    }


    return (
        <section className="Todays-section">
            <div className="navbar-for-todays">
                <h1>
                    {selectedCategory.toLowerCase() === 'all' || selectedCategory.toLowerCase() === 'all category'
                        ? "Today's For You!"
                        : `Today's For You > ${selectedCategory}`}
                </h1>
            </div>

            <div className="products-grid1">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section >
    );
}

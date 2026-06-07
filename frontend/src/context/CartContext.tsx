import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
    cartItemId: number;
    productId: number;
    title: string;
    price: string;
    quantity: number;
    image: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (productId: number) => void;
    removeFromCart: (cartItemId: number) => void;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Initialize loading based on token existence
    const [loading, setLoading] = useState(
        () => !!localStorage.getItem('token')
    );

    // Fetch cart items from backend
    const fetchCart = () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        fetch('http://127.0.0.1:8000/api/cart/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error('Unauthorized or bad request');
                return res.json();
            })
            .then((data) => {
                setCartItems(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching cart from DB:', err);
                setLoading(false);
            });
    };

    // Load cart on mount if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
        return;
    }

    const loadCart = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/cart/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Unauthorized or bad request');
            }

            const data = await res.json();
            setCartItems(data);
        } catch (err) {
            console.error('Error fetching cart from DB:', err);
        } finally {
            setLoading(false);
        }
    };

    loadCart();
}, []);


    // Add item to cart
    const addToCart = (productId: number) => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please login to add products to your cart!');
            return;
        }

        fetch('http://127.0.0.1:8000/api/cart/add/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity: 1
            }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to append item');
                return res.json();
            })
            .then(() => {
                fetchCart();
            })
            .catch((err) => console.error('Cart sync error:', err));
    };

    // Remove item from cart
    const removeFromCart = (cartItemId: number) => {
        const token = localStorage.getItem('token');

        if (!token) return;

        fetch(`http://127.0.0.1:8000/api/cart/delete/${cartItemId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to remove item');
                return res.json();
            })
            .then(() => {
                fetchCart();
            })
            .catch((err) => console.error('Cart removal error:', err));
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                loading
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export { CartContext };
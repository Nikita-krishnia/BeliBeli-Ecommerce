import { useEffect, useState } from 'react';
import './Categories.css';

const CATEGORY_STICKERS: { [key: string]: string } = {
    "t-shirt": "👕",
    "jacket": "🧥",
    "shirt": "👔",
    "jeans": "👖",
    "bag": "💼",
    "shoes": "🥾",
    "watches": "⌚",
    "cap": "🧢",
    "all category": "🎛️"
};

interface CategoriesProps {
    onSelectCategory: (category: string) => void;
}

const DEFAULT_STICKER = "📦";

export default function Categories({onSelectCategory}:CategoriesProps) {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/categories/')
            .then(res => res.json())
            .then(data => {
                setCategories([...data, "All Category"]);
            })
            .catch(err => console.error("Error loading categories bar:", err));
    }, []);

    return (
        <div className="categories-section-container">
            <div className="categories-bar-wrapper">
                {categories.map((category, idx) => {
                    const normalized_name = category.toLowerCase().trim();
                    
                    const stickerIcon = CATEGORY_STICKERS[normalized_name] || DEFAULT_STICKER;

                    return (
                        <div key={idx} className="category-item-container" onClick={() => onSelectCategory(category)}>
                            <button className="category-sticker-circle">
                                <span className="sticker">{stickerIcon}</span>
                            </button>
                            <span className="category-text">{category}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
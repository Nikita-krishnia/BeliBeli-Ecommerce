import { useEffect, useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import './VisualSearchModal.css';

interface MatchedProduct {
    id: number;
    title: string;
    price: string;
    oldPrice?: string;
    image: string;
    rating: number;
    soldCount: string;
    category: string;
    matchScore: number;
}

interface VisualSearchModalProps {
    isOpen: boolean;
    onClose: () => void;    
    imageFile: File | null;
    previewUrl: string; // ➔ 1. Accept the static preview URL directly as a prop
    loading: boolean; 
    setLoading: (value: boolean) => void; 
}

export default function VisualSearchModal({ isOpen, onClose, imageFile, previewUrl, loading, setLoading }: VisualSearchModalProps) {
    const [matches, setMatches] = useState<MatchedProduct[]>([]);

    useEffect(() => {
        if (!imageFile) return;

        const formData = new FormData();
        formData.append('image', imageFile);

        const sendVisualSearch = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/products/visual-search/', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setMatches(data);
                }
            } catch (err) {
                console.error("Visual search API failure:", err);
            } finally {
                setLoading(false); 
            }
        };

        sendVisualSearch();
        
        // ➔ 2. Notice there are NO state setters or cleanups here. Purely hits the API exactly ONCE.
    }, [imageFile, setLoading]); 

    const handleModalClose = () => {
        setMatches([]);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="visual-modal-backdrop">
            <div className="visual-modal-window">
                <button className="visual-modal-close" onClick={handleModalClose}>
                    <X size={20} />
                </button>

                <div className="visual-modal-layout">
                    <div className="visual-preview-section">
                        <h3>Your Uploaded Image</h3>
                        {previewUrl && <img src={previewUrl} alt="Uploaded Search Input" className="user-uploaded-preview" />}
                    </div>

                    <div className="visual-results-section">
                        <div className="results-header">
                            <Sparkles size={18} className="sparkle-ai" />
                            <h3>AI Similar Matches</h3>
                        </div>

                        {loading ? (
                            <div className="visual-loading-box">
                                <Loader2 className="animate-spin" size={32} />
                                <p>Analyzing shapes, textures, and features with CLIP Vision AI...</p>
                            </div>
                        ) : matches.length === 0 ? (
                            <div className="visual-empty-box">
                                <p>No exact product visual matches found in our catalog.</p>
                            </div>
                        ) : (
                            <div className="visual-cards-scroll-grid">
                                {matches.map((product) => (
                                    <div key={product.id} className="match-card-wrapper" onClick={handleModalClose}>
                                        <div className="ai-match-badge">
                                            {product.matchScore}% Match
                                        </div>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
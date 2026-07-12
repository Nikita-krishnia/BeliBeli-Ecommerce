import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './FlashSale.css';
import ProductCard from './ProductCard';
import API_BASE_URL from '../config';
import Loader from './Loader';


interface SaleItemDetails {
    id: number;
    title: string;
    price: string;
    oldPrice: string;
    image: string;
    rating?: number;
    soldCount?: string;
    category?: string;
}

const FlashSale = () => {
    const [targetTime] = useState(() => {
        const target = new Date();

        target.setHours(20, 0, 0, 0);

        if (new Date().getTime() > target.getTime()) {      //if time finish then set for tomarrow for same time
            target.setDate(target.getDate() + 1);
        }

        return target.getTime()
    });

    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);
    const [products, setProducts] = useState<SaleItemDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetTime - now; //in miliseconds

            if (difference <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                setIsExpired(true);
                return false;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
            return true;
        };
        calculateTimeLeft();

        const timer = setInterval(() => {
            const active = calculateTimeLeft();
            if (!active) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime]);

    const formatTime = (num: number): string => {
        return num < 10 ? `0${num}` : String(num);
    };

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/products/`)
            .then((response) => response.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data from Django:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="flash-sale-section">
                <div className="flash-products-container skeleton-row">                    {Array.from({ length: 6 }).map((_, i) => (
                    <Loader key={i} />
                ))}
                </div>
            </section>
        );
    }



    return (
        <section className="flash-sale-section">
            <div className="flash-header">
                <div className="flash-title-container">
                    <div className="flash-icon-wrapper">
                        <Zap size={20} fill="white" color="white" />
                    </div>
                    <h2>Flash Sale</h2>

                    <div className="timer-container">
                        {isExpired ? (
                            <span className="expired-label">OFFER EXPIRED</span>
                        ) : (
                            <>
                                <span className="time-block">{formatTime(timeLeft.hours)}</span>
                                <span className="time-colon">:</span>
                                <span className="time-block">{formatTime(timeLeft.minutes)}</span>
                                <span className="time-colon">:</span>
                                <span className="time-block">{formatTime(timeLeft.seconds)}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flash-nav-buttons">
                    <button className="nav-btn prev-btn">←</button>
                    <button className="nav-btn next-btn">→</button>
                </div>
            </div>

            <div className="flash-products-container">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={16}
                    slidesPerView={4.2}
                    breakpoints={{
                        0: {
                            slidesPerView: 1.3,
                            spaceBetween: 12,
                        },
                        480: {
                            slidesPerView: 2.2,
                            spaceBetween: 16,
                        },
                        768: {
                            slidesPerView: 3.2,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 4.2,
                            spaceBetween: 30,
                        },
                    }}
                    className="mySwiper"


                    navigation={{
                        prevEl: '.prev-btn',
                        nextEl: '.next-btn',
                    }}
                >

                    {products.map((item) => (
                        <SwiperSlide key={item.id}>
                            <ProductCard product={{
                                id: item.id,
                                title: item.title,
                                price: item.price,
                                oldPrice: item.oldPrice,

                                rating: item.rating !== undefined ? item.rating : 4.5,
                                soldCount: item.soldCount !== undefined ? item.soldCount : "0",

                                image: item.image
                            }} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}

export default FlashSale;


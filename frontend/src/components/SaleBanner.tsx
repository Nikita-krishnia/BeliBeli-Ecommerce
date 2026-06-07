import './SaleBanner.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface bannerDetail{
    id:number;
    hashtag_line:string;
    title:string;
    below_title:string;
    image:string;
}
const banner_slides: bannerDetail[] = [
    {
        id: 1,
        hashtag_line: "#Big Fashion Sale",
        title: "Limited Time Offer! Up to 50% OFF!",
        below_title: "Redefine Your Everyday Style ",
        image: './img/products/tshirt.png'
    },
    {
        id: 2,
        hashtag_line: "#Deals on Fashion and Beauty",
        title: "Starting from 199! The Offer is Limited !",
        below_title: "Redefine Your Everyday Style ",
        image: './img/products/banner.png'
    },
    {
        id: 3,
        hashtag_line: "#Big Fashion Sale",
        title: "Up To 70% OFF!",
        below_title: "Timeless Style Modern You!",
        image: './img/products/banner32.png'
    }
]
export default function SaleBanner() {

return (
    <section className="sale-banner">
        <div className="banner-container">

            <Swiper 
            modules={[Autoplay, Pagination]}
            spaceBetween={30} 
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            >
            {banner_slides.map((slide) => (
                        <SwiperSlide key={slide.id}>
                            <div className="swiper-slide-content">
                                <div className="banner-content">
                                    <span className="banner-tagline">{slide.hashtag_line}</span>
                                    <h1 className="banner-title">{slide.title}</h1>
                                    <p className="below-title">{slide.below_title}</p>
                                </div>
                                <div className="banner-image-container">
                                    <img src={slide.image} alt="Promo" className="banner-img" />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
            </Swiper>

        </div>

    </section>


);

}
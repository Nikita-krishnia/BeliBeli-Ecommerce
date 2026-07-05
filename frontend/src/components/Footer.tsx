import { siFacebook, siYoutube, siInstagram } from 'simple-icons';
import './Footer.css';

interface FooterLinkDetail {
    title: string;
    links: string[];
}

const FOOTER_COLUMNS: FooterLinkDetail[] = [
    {
        title: "BeliBeli",
        links: ["About BeliBeli", "Career", "Mitra Blog", "B2B Digital"]
    },
    {
        title: "Buy",
        links: ["Bill & Top Up", "BeliBeli COD", "Mitra Blog", "Promo"]
    },
    {
        title: "Sell",
        links: ["Seller Education Center", "Brand Index", "Register Official Store"]
    },
    {
        title: "Guide and Help",
        links: ["BeliBeli Care", "Term and Condition", "Privacy", "Mitra"]
    }
];

export default function Footer() {
    return (
        <footer className="site-footer">

            <div className="footer-banner">
                <div className="banner-overlay">
                    <h2>“Let's Shop Beyond Boundaries”</h2>
                </div>
            </div>

            
            <div className="footer-container">

                <div className="footer-brand-column">
                    <div className="footer-logo">
                        <img src="/img/products/footer-logo.jpg" alt="BeliBeli Logo" className="logo-img1" />
                        <span className="logo-text1">BeliBeli.com</span>
                    </div>
                    <p className="footer-tagline">“Let's Shop Beyond Boundaries”</p>

                    <div className="footer-social-icons">
                        <a href="#facebook" ><svg fill={`#${siFacebook.hex}`} viewBox="0 0 24 24" width="24" height="24">
                            <path d={siFacebook.path} />
                        </svg></a>
                        <a href="#youtube" > <svg fill={`#${siYoutube.hex}`} viewBox="0 0 24 24" width="24" height="24">
                            <path d={siYoutube.path} />
                        </svg></a>
                        <a href="#instagram"> <svg fill={`#${siInstagram.hex}`} viewBox="0 0 24 24" width="24" height="24">
                            <path d={siInstagram.path} />
                        </svg></a>
                    </div>
                </div>

                <div className="footer-links-grid">
                    {FOOTER_COLUMNS.map((group, index) => (
                        <div className="footer-link-group" key={index}>
                            <h4>{group.title}</h4>
                            <ul>
                                {group.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>


        </footer>
    );
}

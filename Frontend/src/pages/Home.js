import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowRight, FaStar, FaEnvelope, FaHeadphones, FaShippingFast, FaUndo, FaLock } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Home.css";
import { API_URL } from "../config.js";
export default function Home() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Fetch top 4 products for trending section
axios.get(`${API_URL}/api/products?size=4`)
      .then(res => setTrending(res.data.content || []))
      .catch(err => console.error(err));
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const categories = [
    { id: 1, name: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", count: "3 Products" },
    { id: 2, name: "Fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", count: "2 Products" },
    { id: 3, name: "Home & Living", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", count: "2 Products" },
    { id: 4, name: "Fitness & Outdoors", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&q=80", count: "Coming Soon" },
  ];

  const testimonials = [
    { name: "Sarah Jenkins", role: "Verified Buyer", rating: 5, comment: "I ordered the Wireless Headphones and they exceeded my expectations! Sound isolation is great and shipping was incredibly fast.", avatar: "S" },
    { name: "David Chen", role: "Tech Enthusiast", rating: 5, comment: "Shoply has become my go-to for quality electronics. The support team resolved a address issue I had in minutes. Highly professional service!", avatar: "D" },
    { name: "Emily Watson", role: "Frequent Customer", rating: 4, comment: "Beautiful product cards and simple checkout. The Leather Messenger Bag is exactly what I was searching for. Worth every penny.", avatar: "E" }
  ];

  return (
    <div className="home-wrapper">
      <Navbar />

      {/* Hero Banner Section */}
      <header className="hero-banner">
        <div className="hero-overlay"></div>
        <div className="hero-content animate-fade">
          <span className="hero-tag">Summer Collection 2026</span>
          <h1>Elevate Your Lifestyle</h1>
          <p>Explore our curated selection of high-fidelity electronics, handcrafted leather apparel, and modern home decor.</p>
          <div className="hero-actions">
            <button className="btn-premium hero-btn" onClick={() => navigate("/products")}>
              Shop Collection <FaArrowRight />
            </button>
          </div>
        </div>
      </header>

      {/* Features Value Prop Section */}
      <section className="features-prop">
        <div className="feature-prop-card">
          <FaShippingFast className="prop-icon" />
          <div>
            <h4>Free Shipping</h4>
            <p>On all orders above ₹5000</p>
          </div>
        </div>
        <div className="feature-prop-card">
          <FaUndo className="prop-icon" />
          <div>
            <h4>Easy Returns</h4>
            <p>14-day hassle-free return policy</p>
          </div>
        </div>
        <div className="feature-prop-card">
          <FaHeadphones className="prop-icon" />
          <div>
            <h4>24/7 Support</h4>
            <p>Instant help from our expert team</p>
          </div>
        </div>
        <div className="feature-prop-card">
          <FaLock className="prop-icon" />
          <div>
            <h4>Secure Payments</h4>
            <p>Fully encrypted transactions</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Featured Categories</h2>
          <p>Find the perfect items categorized for your convenience</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="category-card"
              onClick={() => navigate(`/products?categoryId=${cat.id}`)}
            >
              <img src={cat.image} alt={cat.name} />
              <div className="category-card-overlay">
                <h3>{cat.name}</h3>
                <span>{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="trending-section">
        <div className="section-header">
          <h2>Trending Products</h2>
          <p>Explore what's hot and in-demand right now</p>
        </div>
        <div className="trending-grid">
          {trending.map((p) => (
            <div key={p.id} className="trending-card" onClick={() => navigate(`/products/${p.id}`)}>
              {p.discountPercentage > 0 && (
                <span className="badge-discount">-{p.discountPercentage}%</span>
              )}
              <div className="trending-img-wrapper">
                <img src={p.imageUrl} alt={p.name} />
              </div>
              <div className="trending-info">
                <span className="brand-label">{p.brand || "Generic"}</span>
                <h3>{p.name}</h3>
                <div className="trending-rating">
                  <FaStar className="star-icon" />
                  <span>{p.averageRating}</span>
                </div>
                <div className="trending-footer">
                  <span className="price-tag">₹{p.price}</span>
                  <button className="trending-view-btn">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-box">
          <button className="btn-premium" onClick={() => navigate("/products")}>
            View All Products
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Hear feedback from our satisfied shopping community</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">{t.avatar}</div>
                <div>
                  <h4>{t.name}</h4>
                  <span className="role">{t.role}</span>
                </div>
              </div>
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < t.rating ? "star active" : "star"} />
                ))}
              </div>
              <p>"{t.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-overlay"></div>
        <div className="newsletter-content">
          <h2>Subscribe to our Newsletter</h2>
          <p>Get 10% off your first order! Stay updated on exclusive launches, special sales, and coupon codes.</p>
          
          {subscribed ? (
            <div className="newsletter-success animate-fade">
              🎉 Thank you for subscribing! Check your email for your WELCOME10 coupon.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-box">
                <FaEnvelope className="envelope-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-premium subscribe-btn">Subscribe</button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <img src="/logo.png" alt="easybuy Logo" style={{height: "120px", width: "auto", objectFit: "contain", alignSelf: "center", marginBottom: "12px", display: "block"}} />
            <p>easybuy is a premium, secure, and modern e-commerce marketplace dedicated to providing premium quality accessories and tech items.</p>
            <div className="payment-badges">
              <span>💳 Visa</span>
              <span>💳 Mastercard</span>
              <span>📲 UPI</span>
              <span>📦 COD</span>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => navigate("/products")}>Browse Catalog</li>
              <li onClick={() => navigate("/cart")}>View Cart</li>
              <li onClick={() => navigate("/wishlist")}>Your Wishlist</li>
              <li onClick={() => navigate("/orders")}>Track Orders</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Popular Tech</h4>
            <ul>
              <li onClick={() => navigate("/products?categoryId=1")}>Headphones</li>
              <li onClick={() => navigate("/products?categoryId=1")}>Keyboards</li>
              <li onClick={() => navigate("/products?categoryId=1")}>Smartwatches</li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4>Contact Info</h4>
            <p>📍 123 E-Commerce Blvd, San Jose, CA, USA</p>
            <p>📞 +1 (555) 123-4567</p>
            <p>✉️ support@easybuy.com</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} easybuy Inc. All rights reserved. Portfolio E-Commerce Demonstration.</p>
        </div>
      </footer>
    </div>
  );
}

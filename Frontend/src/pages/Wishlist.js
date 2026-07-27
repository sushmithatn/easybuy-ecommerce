import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaShoppingCart, FaHeart, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Wishlist.css";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadWishlist = useCallback(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios.get("http://localhost:8080/api/wishlist", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setItems(res.data))
    .catch(err => console.error("Error loading wishlist:", err));
  }, [token, navigate]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const remove = (id) => {
    axios.delete(`http://localhost:8080/api/wishlist/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(loadWishlist)
    .catch(err => console.error("Error removing wishlist item:", err));
  };

  const addToCart = async (productId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/cart/add/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart 🛒");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const buyNow = async (productId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/cart/add/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/payment");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to proceed with Buy");
    }
  };

  return (
    <div className="wishlist-wrapper">
      <Navbar />

      <div className="breadcrumb-nav">
        <span onClick={() => navigate("/products")}>Shop</span>
        <FaChevronRight className="divider" />
        <span className="active-category">Wishlist</span>
      </div>

      <div className="wishlist-container">
        <h1 className="wishlist-page-title">My Wishlist</h1>

        {items.length > 0 ? (
          <div className="wishlist-grid animate-fade">
            {items.map(item => {
              const p = item.product;
              return (
                <div key={item.id} className="wishlist-card" onClick={() => navigate(`/products/${p.id}`)}>
                  {p.discountPercentage > 0 && (
                    <span className="wishlist-card-badge">-{p.discountPercentage}%</span>
                  )}
                  
                  <div className="wishlist-img-box">
                    <img src={p.imageUrl} alt={p.name} />
                  </div>

                  <div className="wishlist-info">
                    <span className="wishlist-brand">{p.brand}</span>
                    <h3>{p.name}</h3>
                    <span className="wishlist-price">₹{p.price}</span>
                  </div>

                  <div className="wishlist-card-actions">
                    <button 
                      className="btn-premium wishlist-add-cart"
                      onClick={(e) => { e.stopPropagation(); addToCart(p.id); }}
                      disabled={p.stock === 0}
                    >
                      Add
                    </button>
                    <button 
                      className="btn-premium wishlist-buy"
                      onClick={(e) => { e.stopPropagation(); buyNow(p.id); }}
                      disabled={p.stock === 0}
                    >
                      Buy
                    </button>
                    <button 
                      className="wishlist-remove"
                      onClick={(e) => { e.stopPropagation(); remove(item.id); }}
                      title="Remove Item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wishlist-empty-view animate-fade">
            <FaHeart className="empty-wishlist-icon" />
            <h2>Your Wishlist is Empty</h2>
            <p>Save items you like in your wishlist to purchase them later. Click on the heart icon on any product card to add it here.</p>
            <button className="btn-premium" onClick={() => navigate("/products")}>
              Explore Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

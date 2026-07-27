import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaStar, FaChevronRight, FaRegStar, FaExchangeAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery image selection
  const [selectedImage, setSelectedImage] = useState("");

  // Quantity count
  const [quantity, setQuantity] = useState(1);

  // Tab control
  const [activeTab, setActiveTab] = useState("description");

  // Review form states
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  // Recently Viewed & Compare states
  const [recentProducts, setRecentProducts] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const token = localStorage.getItem("token");

  // Update Recently Viewed List in LocalStorage and State
  const updateRecentlyViewed = useCallback((currentId) => {
    let recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    // Remove if already exists to push to front
    recent = recent.filter(x => x !== currentId);
    recent.unshift(currentId);
    recent = recent.slice(0, 4);
    localStorage.setItem("recentlyViewed", JSON.stringify(recent));

    // Fetch details for recent products (excluding current one)
    const otherIds = recent.filter(x => x !== currentId);
    if (otherIds.length > 0) {
      Promise.all(
        otherIds.map(oId => 
          axios.get(`http://localhost:8080/api/products/${oId}`).then(res => res.data).catch(() => null)
        )
      ).then(results => {
        setRecentProducts(results.filter(r => r !== null));
      });
    } else {
      setRecentProducts([]);
    }
  }, []);

  const loadProductData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Product
      const prodRes = await axios.get(`http://localhost:8080/api/products/${id}`);
      const prod = prodRes.data;
      setProduct(prod);
      setSelectedImage(prod.imageUrl);

      // Update recently viewed
      updateRecentlyViewed(prod.id);

      // 2. Fetch Reviews
      const reviewsRes = await axios.get(`http://localhost:8080/api/reviews/product/${id}`);
      setReviews(reviewsRes.data);

      // 3. Fetch Related Products (same category)
      if (prod.categoryId) {
        const relatedRes = await axios.get(
          `http://localhost:8080/api/products?categoryId=${prod.categoryId}&size=4`
        );
        const filteredRelated = (relatedRes.data.content || []).filter(item => item.id !== prod.id);
        setRelated(filteredRelated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, updateRecentlyViewed]);

  // Sync Compare List
  const loadCompareList = useCallback(() => {
    const list = JSON.parse(localStorage.getItem("compareList") || "[]");
    setCompareList(list);
  }, []);

  useEffect(() => {
    loadProductData();
    loadCompareList();
    window.scrollTo(0, 0);
  }, [loadProductData, loadCompareList]);

  const handleAddToCompare = () => {
    let list = JSON.parse(localStorage.getItem("compareList") || "[]");
    if (list.some(x => x.id === product.id)) {
      alert("Product already in compare list!");
      return;
    }
    if (list.length >= 3) {
      alert("You can compare up to 3 products at a time!");
      return;
    }
    list.push(product);
    localStorage.setItem("compareList", JSON.stringify(list));
    setCompareList(list);
    alert("Added to comparison tray!");
  };

  const handleRemoveFromCompare = (prodId) => {
    let list = compareList.filter(x => x.id !== prodId);
    localStorage.setItem("compareList", JSON.stringify(list));
    setCompareList(list);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="details-container container">
          <div className="details-loading-skeleton">
            <div className="skeleton skeleton-gallery"></div>
            <div className="skeleton skeleton-info"></div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="details-container container text-center py-5">
          <h2>Product not found 😕</h2>
          <button className="btn-premium mt-3" onClick={() => navigate("/products")}>Back to Shop</button>
        </div>
      </>
    );
  }

  let specificationsObj = {};
  try {
    if (product.specifications) {
      specificationsObj = JSON.parse(product.specifications);
    }
  } catch (err) {
    console.error("Error parsing specifications:", err);
  }

  const addToCart = async () => {
    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await axios.post(
          `http://localhost:8080/api/cart/add/${product.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      alert(`Added ${quantity} item(s) to cart 🛒`);
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart");
    }
  };

  const buyNow = async () => {
    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        await axios.post(
          `http://localhost:8080/api/cart/add/${product.id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      navigate("/payment");
    } catch (err) {
      console.error(err);
      alert("Failed to proceed with Buy Now");
    }
  };

  const addToWishlist = async () => {
    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/wishlist/${product.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to wishlist ❤️");
    } catch (err) {
      console.error(err);
      alert("Failed to add to wishlist");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/reviews/product/${product.id}`,
        { rating: userRating, comment: userComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewMessage("Review submitted successfully! Refreshing...");
      setUserComment("");
      setUserRating(5);
      
      setTimeout(() => {
        loadProductData();
        setReviewMessage("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setReviewMessage(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="details-wrapper">
      <Navbar />

      <div className="breadcrumb-nav">
        <span onClick={() => navigate("/products")}>Shop</span>
        <FaChevronRight className="divider" />
        <span className="active-category">{product.categoryName || "Catalog"}</span>
        <FaChevronRight className="divider" />
        <span className="active-product">{product.name}</span>
      </div>

      <div className="details-container">
        {/* Gallery Section */}
        <div className="details-gallery">
          <div className="main-image-container">
            <img src={selectedImage} alt={product.name} className="zoom-image" />
          </div>
          
          {product.galleryImages && product.galleryImages.length > 0 && (
            <div className="thumbnail-gallery">
              <img 
                src={product.imageUrl} 
                alt="thumbnail" 
                className={selectedImage === product.imageUrl ? "active" : ""}
                onClick={() => setSelectedImage(product.imageUrl)}
              />
              {product.galleryImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`thumbnail-${idx}`}
                  className={selectedImage === img ? "active" : ""}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="details-info">
          <span className="brand">{product.brand}</span>
          <h1>{product.name}</h1>
          
          <div className="rating-row">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < Math.floor(product.averageRating) ? "star-active" : "star-inactive"} 
                />
              ))}
            </div>
            <b>{product.averageRating} Rating</b>
            <span>&bull;</span>
            <span className="reviews-count">{reviews.length} Reviews</span>
          </div>

          <div className="price-row">
            <span className="price">₹{product.price}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="original-price">₹{Math.round(product.price * (100 / (100 - product.discountPercentage)))}</span>
                <span className="discount-tag">{product.discountPercentage}% OFF</span>
              </>
            )}
          </div>

          <p className="summary-desc">{product.description}</p>

          <hr />

          {/* Availability */}
          <div className="meta-row">
            <span className="label">Availability:</span>
            <span className="value">
              {product.stock === 0 ? (
                <b className="stock-out">Out of Stock</b>
              ) : product.stock <= 5 ? (
                <b className="stock-low">Only {product.stock} items left!</b>
              ) : (
                <b className="stock-in">In Stock (Ready to Ship)</b>
              )}
            </span>
          </div>

          {/* Action Row */}
          <div className="action-row">
            <div className="qty-selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={product.stock === 0}
              >
                +
              </button>
            </div>

            <button 
              className="btn-premium add-cart-action-btn" 
              onClick={addToCart}
              disabled={product.stock === 0}
            >
              <FaShoppingCart /> Add to Cart
            </button>

            <button 
              className="btn-premium buy-now-action-btn" 
              onClick={buyNow}
              disabled={product.stock === 0}
            >
              Buy
            </button>

            <button className="wishlist-action-btn" onClick={addToWishlist} title="Add to Wishlist">
              <FaHeart />
            </button>

            <button className="compare-action-btn" onClick={handleAddToCompare} title="Add to Compare">
              <FaExchangeAlt /> Compare
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
        <div className="tabs-headers">
          <button 
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button 
            className={activeTab === "specifications" ? "active" : ""}
            onClick={() => setActiveTab("specifications")}
          >
            Specifications
          </button>
          <button 
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === "description" && (
            <div className="tab-desc animate-fade">
              <h3>About this Product</h3>
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === "specifications" && (
            <div className="tab-specs animate-fade">
              <h3>Technical Specifications</h3>
              {Object.keys(specificationsObj).length > 0 ? (
                <table className="specs-table">
                  <tbody>
                    {Object.entries(specificationsObj).map(([key, val]) => (
                      <tr key={key}>
                        <th>{key}</th>
                        <td>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No specifications provided for this product.</p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="tab-reviews animate-fade">
              <div className="reviews-layout">
                <div className="reviews-list">
                  <h3>Customer Reviews</h3>
                  {reviews.length > 0 ? (
                    reviews.map(r => (
                      <div key={r.id} className="review-item">
                        <div className="review-header">
                          <div className="review-user-info">
                            <b>{r.userFullName || r.username}</b>
                            <span className="date">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="review-stars">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} className={i < r.rating ? "star-active" : "star-inactive"} />
                            ))}
                          </div>
                        </div>
                        <p>{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p>No reviews yet. Be the first to review this product!</p>
                  )}
                </div>

                <div className="submit-review-card">
                  <h3>Write a Review</h3>
                  {reviewMessage && <div className="review-alert">{reviewMessage}</div>}
                  
                  <form onSubmit={handleReviewSubmit}>
                    <div className="rating-select-group">
                      <span>Your Rating:</span>
                      <div className="rating-select-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setUserRating(star)}
                            className="star-select-btn"
                          >
                            {star <= userRating ? <FaStar className="star-active" /> : <FaRegStar className="star-inactive" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Comments</label>
                      <textarea
                        rows="4"
                        placeholder="Write your feedback..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-premium submit-review-btn">
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Products */}
      {recentProducts.length > 0 && (
        <section className="related-section">
          <div className="section-header">
            <h2>Recently Viewed</h2>
            <p>Your search history and items you looked at recently</p>
          </div>
          
          <div className="related-grid">
            {recentProducts.map(p => (
              <div 
                key={p.id} 
                className="related-card"
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div className="related-img-box">
                  <img src={p.imageUrl} alt={p.name} />
                </div>
                <div className="related-info">
                  <h4>{p.name}</h4>
                  <b>₹{p.price}</b>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-header">
            <h2>Related Products</h2>
            <p>Similar products you might also be interested in</p>
          </div>
          
          <div className="related-grid">
            {related.map(p => (
              <div 
                key={p.id} 
                className="related-card"
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div className="related-img-box">
                  <img src={p.imageUrl} alt={p.name} />
                </div>
                <div className="related-info">
                  <h4>{p.name}</h4>
                  <b>₹{p.price}</b>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating Compare Tray at the bottom */}
      {compareList.length > 0 && (
        <div className="compare-floating-tray animate-fade">
          <div className="tray-info">
            <span>Compare Tray ({compareList.length}/3)</span>
          </div>
          <div className="tray-items">
            {compareList.map(item => (
              <div key={item.id} className="tray-item-thumb">
                <img src={item.imageUrl} alt={item.name} />
                <button className="remove-thumb-btn" onClick={() => handleRemoveFromCompare(item.id)}>&times;</button>
              </div>
            ))}
          </div>
          <div className="tray-actions">
            <button className="btn-premium" onClick={() => setShowCompareModal(true)}>Compare Now</button>
            <button className="clear-tray-btn" onClick={() => { localStorage.removeItem("compareList"); setCompareList([]); }}>Clear All</button>
          </div>
        </div>
      )}

      {/* Compare Side-by-side Modal */}
      {showCompareModal && (
        <div className="modal-overlay animate-fade" onClick={() => setShowCompareModal(false)}>
          <div className="modal-card compare-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCompareModal(false)}>&times;</button>
            <h2>Compare Products</h2>

            <div className="compare-table-wrapper">
              <table className="compare-details-table">
                <thead>
                  <tr>
                    <th>Attributes</th>
                    {compareList.map(item => (
                      <th key={item.id}>
                        <img src={item.imageUrl} alt={item.name} className="compare-header-img" />
                        <h4 className="compare-header-name">{item.name}</h4>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>Price</th>
                    {compareList.map(item => <td key={item.id} className="compare-price-cell">₹{item.price}</td>)}
                  </tr>
                  <tr>
                    <th>Brand</th>
                    {compareList.map(item => <td key={item.id}><b>{item.brand || "Generic"}</b></td>)}
                  </tr>
                  <tr>
                    <th>Rating</th>
                    {compareList.map(item => (
                      <td key={item.id}>
                        <FaStar className="star-active" /> {item.averageRating} / 5
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Stock</th>
                    {compareList.map(item => (
                      <td key={item.id} className={item.stock > 0 ? "stock-in" : "stock-out"}>
                        {item.stock > 0 ? `In Stock (${item.stock})` : "Out of Stock"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Specifications</th>
                    {compareList.map(item => {
                      let specsObj = {};
                      try {
                        if (item.specifications) specsObj = JSON.parse(item.specifications);
                      } catch(e) {}
                      return (
                        <td key={item.id}>
                          <ul className="compare-specs-list">
                            {Object.entries(specsObj).map(([k, v]) => (
                              <li key={k}><b>{k}:</b> {v}</li>
                            ))}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
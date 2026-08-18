import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaStar, FaEye, FaFilter, FaTimes } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Products.css";
import { API_URL } from "../config.js";
import { handleApiError, formatImageUrl } from "../utils/apiHandler";


export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Catalog data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Derived filter state directly from URL searchParams (single source of truth)
  const selectedCategory = searchParams.get("categoryId") || "";
  const searchQuery = searchParams.get("search") || "";
  const priceRange = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "id";
  const sortDir = searchParams.get("sortDir") || "desc";
  const currentPage = parseInt(searchParams.get("page") || "0", 10);

  // Mobile sidebar filter toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick view modal states
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch Categories once on mount
  useEffect(() => {
    axios.get(`${API_URL}/api/categories`)
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error("Error loading categories:", err);
        setCategories([]);
      });
  }, []);

  // Fetch Products whenever searchParams change (Single source of truth, 1 request per change)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    let url = `${API_URL}/api/products?page=${currentPage}&size=12&sortBy=${sortBy}&direction=${sortDir}`;
    if (selectedCategory) url += `&categoryId=${selectedCategory}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (priceRange && priceRange !== "") url += `&maxPrice=${priceRange}`;

    axios.get(url)
      .then((res) => {
        if (!isMounted) return;
        const prodData = Array.isArray(res.data?.content) 
          ? res.data.content 
          : (Array.isArray(res.data) ? res.data : []);
        setProducts(prodData);
        setTotalPages(res.data?.totalPages || 0);
        setTotalElements(res.data?.totalElements || prodData.length);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Error loading products:", err);
        setProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [searchParams, currentPage, selectedCategory, searchQuery, priceRange, sortBy, sortDir]);

  const handleCategorySelect = (id) => {
    const newParams = Object.fromEntries(searchParams);
    if (id) {
      newParams.categoryId = id;
    } else {
      delete newParams.categoryId;
    }
    newParams.page = 0;
    setSearchParams(newParams);
  };

  const handlePriceChange = (e) => {
    const val = e.target.value;
    const newParams = Object.fromEntries(searchParams);
    if (val) {
      newParams.maxPrice = val;
    } else {
      delete newParams.maxPrice;
    }
    newParams.page = 0;
    setSearchParams(newParams);
  };

  const clearPriceFilter = () => {
    const newParams = Object.fromEntries(searchParams);
    delete newParams.maxPrice;
    newParams.page = 0;
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const [field, dir] = e.target.value.split("-");
    const newParams = Object.fromEntries(searchParams);
    newParams.sortBy = field;
    newParams.sortDir = dir;
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNo) => {
    const newParams = Object.fromEntries(searchParams);
    newParams.page = pageNo;
    setSearchParams(newParams);
  };

  const handleQuickView = (e, product) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  // add to cart with response messages
  const addToCart = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart/add/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart 🛒");
    } catch (err) {
      handleApiError(err, navigate, "Failed to add to cart");
    }
  };

  const buyNow = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/cart/add/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/payment");
    } catch (err) {
      handleApiError(err, navigate, "Failed to proceed with Buy Now");
    }
  };

  // add to wishlist
  const addToWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      alert("Please login first 🔑");
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/wishlist/${productId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to wishlist ❤️");
    } catch (err) {
      handleApiError(err, navigate, "Failed to add to wishlist");
    }
  };

  return (
    <div className="catalog-wrapper">
      <Navbar />

      <div 
        className={`drawer-backdrop ${sidebarOpen ? "active" : ""}`} 
        onClick={() => setSidebarOpen(false)} 
      />
      <div className="catalog-container">
        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-bar">
          <span>{totalElements} Products found</span>
          <button className="filter-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <FaFilter /> Filters
          </button>
        </div>

        {/* Sidebar Filters */}
        <aside className={`catalog-sidebar ${sidebarOpen ? "active" : ""}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="filter-group">
            <h4>Categories</h4>
            <ul className="category-list">
              <li 
                className={selectedCategory === "" ? "active" : ""}
                onClick={() => handleCategorySelect("")}
              >
                All Categories
              </li>
              {categories.map(c => (
                <li 
                  key={c.id} 
                  className={String(selectedCategory) === String(c.id) ? "active" : ""}
                  onClick={() => handleCategorySelect(c.id)}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0 }}>Price Limit (Max)</h4>
              {priceRange && (
                <button 
                  type="button" 
                  onClick={clearPriceFilter}
                  style={{ background: 'none', border: 'none', color: '#ec4899', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Reset
                </button>
              )}
            </div>
            <div className="price-slider-box">
              <input 
                type="range" 
                min="500" 
                max="10000000" 
                step="5000"
                value={priceRange || 10000000} 
                onChange={handlePriceChange} 
              />
              <div className="price-slider-labels">
                <span>₹500</span>
                <b>{priceRange ? `₹${Number(priceRange).toLocaleString('en-IN')}` : "All Prices"}</b>
                <span>₹1 Cr</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Catalog Main Content */}
        <main className="catalog-main">
          {/* Top Control Bar */}
          <div className="catalog-control-bar">
            <span className="products-count-desk">{totalElements} Products found</span>
            
            <div className="control-right">
              <select className="sort-select" onChange={handleSortChange} defaultValue={`${sortBy}-${sortDir}`}>
                <option value="id-asc">Default Sorting</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="averageRating-desc">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Skeletons or Grid */}
          {loading ? (
            <div className="catalog-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-price"></div>
                  <div className="skeleton skeleton-btn"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="catalog-grid animate-fade">
              {products.map(p => (
                <div 
                  key={p.id} 
                  className="catalog-product-card"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  {p.discountPercentage > 0 && (
                    <span className="card-badge-discount">-{p.discountPercentage}%</span>
                  )}

                  <div className="card-image-box">
                    <img src={formatImageUrl(p.imageUrl)} alt={p.name} />

                    
                    {/* Floating Buttons */}
                    <div className="card-floating-actions">
                      <button onClick={(e) => addToWishlist(e, p.id)} title="Add to Wishlist">
                        <FaHeart />
                      </button>
                      <button onClick={(e) => handleQuickView(e, p)} title="Quick View">
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  <div className="card-content-box">
                    <span className="card-brand">{p.brand}</span>
                    <h3>{p.name}</h3>
                    <div className="card-rating">
                      <FaStar className="star-icon" />
                      <span>{p.averageRating}</span>
                      <span className="stock-indicator">
                        {p.stock === 0 ? (
                          <span className="stock-out">Out of stock</span>
                        ) : p.stock <= 5 ? (
                          <span className="stock-low">Only {p.stock} left</span>
                        ) : (
                          <span className="stock-in">In Stock</span>
                        )}
                      </span>
                    </div>
                    
                    <div className="card-price-row">
                      <span className="price">₹{p.price}</span>
                      <div className="card-actions-group">
                        <button 
                          className="quick-add-btn" 
                          onClick={(e) => addToCart(e, p.id)}
                          disabled={p.stock === 0}
                        >
                          Add
                        </button>
                        <button 
                          className="quick-buy-btn" 
                          onClick={(e) => buyNow(e, p.id)}
                          disabled={p.stock === 0}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products-view animate-fade">
              <h2>No products found</h2>
              <p>We couldn't find matches for your current filter settings or the server is warming up.</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="btn-premium" 
                  onClick={() => setSearchParams({})}
                >
                  Reset Filters & Reload
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index ? "active" : ""}
                  onClick={() => handlePageChange(index)}
                >
                  {index + 1}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <div className="modal-overlay animate-fade" onClick={() => setShowQuickView(false)}>
          <div className="modal-card quickview-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowQuickView(false)}>&times;</button>
            
            <div className="quickview-layout">
              <div className="quickview-img-box">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
              </div>
              
              <div className="quickview-info-box">
                <span className="quickview-brand">{selectedProduct.brand}</span>
                <h2>{selectedProduct.name}</h2>
                <div className="quickview-rating">
                  <FaStar className="star-icon" />
                  <b>{selectedProduct.averageRating}</b>
                  <span>&bull;</span>
                  <span>{selectedProduct.stock > 0 ? "In Stock" : "Out of Stock"}</span>
                </div>

                <p className="quickview-desc">{selectedProduct.description}</p>

                <div className="quickview-price">₹{selectedProduct.price}</div>

                <div className="quickview-actions">
                  <button 
                    className="btn-premium add-cart-action-btn" 
                    onClick={(e) => {
                      addToCart(e, selectedProduct.id);
                      setShowQuickView(false);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn-premium buy-now-action-btn" 
                    onClick={(e) => {
                      buyNow(e, selectedProduct.id);
                      setShowQuickView(false);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    Buy
                  </button>
                  <button 
                    className="quickview-wishlist"
                    onClick={(e) => {
                      addToWishlist(e, selectedProduct.id);
                      setShowQuickView(false);
                    }}
                  >
                    <FaHeart /> Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHeart, FaStar, FaEye, FaFilter, FaTimes } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Products.css";
import { API_URL } from "../config";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Catalog data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("maxPrice") || 25000);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "id");
  const [sortDir, setSortDir] = useState(searchParams.get("sortDir") || "asc");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 0);

  // Mobile sidebar filter toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick view modal states
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch Categories
  useEffect(() => {
axios.get(axios.get(`${API_URL}/api/categories`)

)
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setSearchQuery(searchParams.get("search") || "");
    setCurrentPage(parseInt(searchParams.get("page")) || 0);
  }, [searchParams]);

  // Load Products
  const loadProducts = useCallback(() => {
   setLoading(true);

   let url = `${process.env.REACT_APP_API_URL}/api/products?page=${currentPage}&size=12&sortBy=${sortBy}&direction=${sortDir}`;

   if (selectedCategory) url += `&categoryId=${selectedCategory}`;
   if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
   if (priceRange) url += `&maxPrice=${priceRange}`;

   axios.get(url)
     .then((res) => {
       setProducts(res.data.content || []);
       setTotalPages(res.data.totalPages || 0);
       setTotalElements(res.data.totalElements || 0);
     })
     .catch(console.error)
     .finally(() => setLoading(false));

}, [currentPage, selectedCategory, searchQuery, priceRange, sortBy, sortDir]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
    setCurrentPage(0);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      categoryId: id,
      page: 0
    });
  };

  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
    setCurrentPage(0);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      maxPrice: e.target.value,
      page: 0
    });
  };

  const handleSortChange = (e) => {
    const [field, dir] = e.target.value.split("-");
    setSortBy(field);
    setSortDir(dir);
  };

  const handlePageChange = (pageNo) => {
    setCurrentPage(pageNo);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: pageNo
    });
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart 🛒");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add to cart");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/payment");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to proceed with Buy Now");
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to wishlist ❤️");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add to wishlist");
    }
  };

  return (
    <div className="catalog-wrapper">
      <Navbar />

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
            <h4>Price Limit (Max)</h4>
            <div className="price-slider-box">
              <input 
                type="range" 
                min="500" 
                max="25000" 
                step="500"
                value={priceRange} 
                onChange={handlePriceChange} 
              />
              <div className="price-slider-labels">
                <span>₹500</span>
                <b>₹{priceRange}</b>
                <span>₹25000</span>
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
                    <img src={p.imageUrl} alt={p.name} />
                    
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
              <p>We couldn't find matches for your current filter settings. Try resetting parameters.</p>
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

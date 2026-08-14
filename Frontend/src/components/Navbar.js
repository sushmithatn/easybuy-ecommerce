import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { API_URL } from "../config.js";
import axios from "axios";
import {
  FaShoppingCart,
  FaHeart,
  FaBox,
  FaSignOutAlt,
  FaSearch,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
  FaHome
} from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const loadCounts = useCallback(async () => {
    if (!token) return;

    try {
      const cartRes = await axios.get(`${API_URL}/api/cart/count`,  {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(cartRes.data);

const wishlistRes = await axios.get(`${API_URL}/api/wishlist/count`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistCount(wishlistRes.data);
    } catch (err) {
      console.error("Failed to load counts:", err);
    }
  }, [token]);

  useEffect(() => {
    loadCounts();
    // Set up a listener for storage events or quick interval to refresh counts on actions
    const interval = setInterval(loadCounts, 5000);
    return () => clearInterval(interval);
  }, [loadCounts]);

  // Handle Search Input & Fetch Autocomplete Suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await axios.get(
  `${API_URL}/api/products?search=${searchQuery}&size=5`
);
        setSuggestions(res.data.content || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setSearchQuery("");
    setShowSuggestions(false);
    navigate(`/products/${productId}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand" onClick={() => navigate("/products")}>
          <img src="/logo.png" alt="easybuy Logo" className="brand-logo-img" />
          <span className="brand-name">easybuy</span>
        </div>

        {/* Search Bar */}
        <form className="navbar-search" onSubmit={handleSearchSubmit} ref={suggestionsRef}>
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          <button type="submit" className="search-btn">
            <FaSearch />
          </button>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="search-suggestions">
              {suggestions.map((p) => (
                <li key={p.id} onClick={() => handleSuggestionClick(p.id)}>
                  <img src={p.imageUrl} alt={p.name} className="suggestion-img" />
                  <div className="suggestion-info">
                    <span className="suggestion-name">{p.name}</span>
                    <span className="suggestion-price">₹{p.price}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Hamburger Menu Toggle */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Items */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/products" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={() => setMenuOpen(false)}>
            <FaHome className="nav-icon" /> Shop
          </NavLink>

          <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item navbar-icon active" : "nav-item navbar-icon"} onClick={() => setMenuOpen(false)}>
            <FaShoppingCart className="nav-icon" /> Cart
            {cartCount > 0 && <span className="nav-badge animate-fade">{cartCount}</span>}
          </NavLink>

          <NavLink to="/wishlist" className={({ isActive }) => isActive ? "nav-item navbar-icon active" : "nav-item navbar-icon"} onClick={() => setMenuOpen(false)}>
            <FaHeart className="nav-icon" /> Wishlist
            {wishlistCount > 0 && <span className="nav-badge animate-fade">{wishlistCount}</span>}
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} onClick={() => setMenuOpen(false)}>
            <FaBox className="nav-icon" /> Orders
          </NavLink>

          {/* Theme Toggle in Menu */}
          <button className="navbar-theme-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {/* User Profile / Logout */}
          {token ? (
            <div className="nav-user-section">
              <span className="user-greeting" onClick={() => navigate("/dashboard")}>
                Hi, <b>{username}</b>
              </span>
              <button className="logout-btn" onClick={logout} title="Logout">
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button className="login-nav-btn" onClick={() => { navigate("/login"); setMenuOpen(false); }}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

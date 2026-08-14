import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaShoppingCart, FaArrowRight, FaTag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Cart.css";
import { API_URL } from "../config.js";
import { handleApiError, formatImageUrl } from "../utils/apiHandler";


export default function Cart() {
  const [cart, setCart] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Coupon promo code states
  const [promoCode, setPromoCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  const loadCart = useCallback(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCart(res.data))
      .catch((err) => handleApiError(err, navigate, "Error loading cart"));
  }, [token, navigate]);

  useEffect(() => {
    loadCart();

    const savedCode = localStorage.getItem("appliedCouponCode");
    const savedDiscount = localStorage.getItem("appliedCouponDiscount");
    if (savedCode && savedDiscount) {
      setPromoCode(savedCode);
      setDiscountPercentage(parseFloat(savedDiscount));
      setCouponApplied(true);
    }
  }, [loadCart]);

  const increaseQty = (id) => {
    axios
      .put(
        `${API_URL}/api/cart/increase/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(loadCart)
      .catch((err) => handleApiError(err, navigate, "Cannot increase quantity"));
  };

  const decreaseQty = (id) => {
    axios
      .put(
        `${API_URL}/api/cart/decrease/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(loadCart)
      .catch((err) => handleApiError(err, navigate, "Cannot decrease quantity"));
  };

  const removeItem = (id) => {
    axios
      .delete(`${API_URL}/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(loadCart)
      .catch((err) => handleApiError(err, navigate, "Error removing item"));
  };


  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponApplied(false);
    setDiscountPercentage(0);

    if (!promoCode.trim()) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/coupons/validate/${promoCode.trim().toUpperCase()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const code = promoCode.trim().toUpperCase();
      const perc = res.data.discountPercentage;
      setDiscountPercentage(perc);
      setCouponApplied(true);
      localStorage.setItem("appliedCouponCode", code);
      localStorage.setItem("appliedCouponDiscount", String(perc));
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code");
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const tax = (subtotal - discountAmount) * 0.18; // 18% GST/tax
  const shipping = subtotal > 5000 ? 0 : (cart.length > 0 ? 150 : 0);
  const total = subtotal - discountAmount + tax + shipping;

  return (
    <div className="cart-wrapper">
      <Navbar />

      <div className="cart-container">
        <h1 className="cart-page-title">Shopping Cart</h1>

        {cart.length > 0 ? (
          <div className="cart-layout animate-fade">
            {/* Left side items table */}
            <div className="cart-items-panel">
              <div className="cart-table-header">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>

              <div className="cart-rows-list">
                {cart.map(item => (
                  <div className="cart-row" key={item.id}>
                    <div className="cart-item-info" onClick={() => navigate(`/products/${item.productId}`)}>
                      <img src={formatImageUrl(item.imageUrl)} alt={item.productName} />
                      <div>

                        <h4>{item.productName}</h4>
                        <span className="remove-row-link" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}>
                          <FaTrash /> Remove
                        </span>
                      </div>
                    </div>

                    <span className="cart-item-price">₹{item.price}</span>

                    <div className="qty-selector">
                      <button onClick={() => decreaseQty(item.id)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item.id)}>+</button>
                    </div>

                    <div className="cart-item-total">
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side summary cards */}
            <div className="cart-summary-panel">
              <h3>Summary</h3>

              {/* Coupon inputs */}
              <form onSubmit={handleApplyCoupon} className="cart-promo-form">
                <div className="promo-input-box">
                  <FaTag className="promo-tag-icon" />
                  <input
                    type="text"
                    placeholder="Enter Promo Code (WELCOME10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={couponApplied}
                  />
                </div>
                <button type="submit" className="btn-premium" disabled={couponApplied}>
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </form>
              {couponError && <p className="coupon-error">{couponError}</p>}
              {couponApplied && <p className="coupon-success">Successfully applied {discountPercentage}% discount!</p>}

              <hr />

              <div className="summary-details">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <b>₹{subtotal}</b>
                </div>
                {couponApplied && (
                  <div className="summary-line discount">
                    <span>Discount ({discountPercentage}%)</span>
                    <b>- ₹{discountAmount}</b>
                  </div>
                )}
                <div className="summary-line">
                  <span>Tax (18% GST)</span>
                  <b>₹{tax.toFixed(2)}</b>
                </div>
                <div className="summary-line">
                  <span>Shipping Fee</span>
                  <b>{shipping === 0 ? <span className="free-shipping">FREE</span> : `₹${shipping}`}</b>
                </div>
                <hr />
                <div className="summary-line total-line">
                  <span>Grand Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn-premium checkout-redirect-btn"
                onClick={() => navigate("/payment")}
              >
                Proceed to Checkout <FaArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-empty-view animate-fade">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet. Head back to the store to explore our premium products.</p>
            <button className="btn-premium" onClick={() => navigate("/products")}>
              Go Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

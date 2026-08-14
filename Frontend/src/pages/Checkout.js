import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaChevronRight, FaQrcode } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Checkout.css";
import { API_URL } from "../config.js";

export default function Checkout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success

  // Cart summary states
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Saved addresses list
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Shipping Form States
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  // Loading / Placement states
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Fetch cart & saved addresses
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCart(res.data);
      if (res.data.length === 0) {
        alert("Your cart is empty!");
        navigate("/products");
      }
    })
    .catch(err => console.error(err));

axios.get(`${API_URL}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSavedAddresses(res.data))
    .catch(err => console.error(err));
  }, [token]);

  // Address Selection pre-fill
  const handleSelectAddress = (e) => {
    const addrId = e.target.value;
    if (!addrId) return;

    const selected = savedAddresses.find(a => a.id == addrId);
    if (selected) {
      setStreet(selected.street);
      setCity(selected.city);
      setState(selected.state);
      setZipCode(selected.zipCode);
      setCountry(selected.country);
      setPhoneNumber(selected.phoneNumber);
    }
  };

  // Coupon Application
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponApplied(false);
    setDiscountPercentage(0);

    if (!couponCode.trim()) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/coupons/validate/${couponCode.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscountPercentage(res.data.discountPercentage);
      setCouponApplied(true);
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code");
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercentage / 100);
  const tax = (subtotal - discountAmount) * 0.18; // 18% tax
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal - discountAmount + tax + shipping;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    const payload = {
      paymentMethod,
      shippingStreet: street,
      shippingCity: city,
      shippingState: state,
      shippingZipCode: zipCode,
      shippingCountry: country,
      shippingPhone: phoneNumber,
      couponCode: couponApplied ? couponCode.trim() : null
    };

    try {
      const res = await axios.post(
        `${API_URL}/api/orders/checkout`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlacedOrder(res.data);
      setStep(3); // Success Screen
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to place order. Check stock levels.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <Navbar />

      <div className="checkout-container">
        {/* Stepper Header */}
        <div className="checkout-stepper">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <span className="step-num">1</span>
            <span className="step-label">Shipping</span>
          </div>
          <FaChevronRight className="step-arrow" />
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <span className="step-num">2</span>
            <span className="step-label">Payment</span>
          </div>
          <FaChevronRight className="step-arrow" />
          <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <span className="step-num">3</span>
            <span className="step-label">Success</span>
          </div>
        </div>

        {step < 3 ? (
          <div className="checkout-layout">
            {/* Left Column Forms */}
            <div className="checkout-main-form">
              {step === 1 && (
                <div className="shipping-step animate-fade">
                  <div className="step-title-row">
                    <h2>Shipping Address</h2>
                    {savedAddresses.length > 0 && (
                      <select className="address-prefill-select" onChange={handleSelectAddress}>
                        <option value="">Choose Saved Address</option>
                        {savedAddresses.map(a => (
                          <option key={a.id} value={a.id}>{a.street}, {a.city}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <form onSubmit={handleShippingSubmit}>
                    <div className="input-group">
                      <label>Street Address</label>
                      <input 
                        type="text" 
                        className="input-premium"
                        placeholder="123 Shopping Lane, Apartment 4B"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required 
                      />
                    </div>

                    <div className="input-row-grid">
                      <div className="input-group">
                        <label>City</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="San Jose"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="input-group">
                        <label>State</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="CA"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="input-row-grid">
                      <div className="input-group">
                        <label>Zip Code</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="95112"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="input-group">
                        <label>Country</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="USA"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Contact Phone Number</label>
                      <input 
                        type="tel" 
                        className="input-premium"
                        placeholder="+1 (555) 123-4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required 
                      />
                    </div>

                    <button type="submit" className="btn-premium step-submit-btn">
                      Proceed to Payment
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div className="payment-step animate-fade">
                  <h2>Payment Details</h2>

                  <div className="payment-method-selector">
                    <label className={`method-card ${paymentMethod === "CARD" ? "active" : ""}`}>
                      <input 
                        type="radio" 
                        value="CARD" 
                        checked={paymentMethod === "CARD"} 
                        onChange={() => setPaymentMethod("CARD")} 
                      />
                      <FaCreditCard className="method-icon" />
                      <span>Credit/Debit Card</span>
                    </label>

                    <label className={`method-card ${paymentMethod === "UPI" ? "active" : ""}`}>
                      <input 
                        type="radio" 
                        value="UPI" 
                        checked={paymentMethod === "UPI"} 
                        onChange={() => setPaymentMethod("UPI")} 
                      />
                      <FaQrcode className="method-icon" />
                      <span>UPI Scan</span>
                    </label>

                    <label className={`method-card ${paymentMethod === "COD" ? "active" : ""}`}>
                      <input 
                        type="radio" 
                        value="COD" 
                        checked={paymentMethod === "COD"} 
                        onChange={() => setPaymentMethod("COD")} 
                      />
                      <span className="method-icon">📦</span>
                      <span>Cash on Delivery</span>
                    </label>
                  </div>

                  {paymentMethod === "CARD" && (
                    <div className="card-payment-form animate-fade">
                      {/* Premium Interactive Mockup Card */}
                      <div className="credit-card-mockup">
                        <div className="card-chip"></div>
                        <div className="card-number-display">{cardNumber || "•••• •••• •••• ••••"}</div>
                        <div className="card-holder-row">
                          <div>
                            <span className="card-label">Card Holder</span>
                            <div className="card-holder-display">{cardHolder || "YOUR NAME"}</div>
                          </div>
                          <div>
                            <span className="card-label">Expires</span>
                            <div className="card-expiry-display">{cardExpiry || "MM/YY"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="4532 7182 9381 0293"
                          maxLength="19"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label>Card Holder Name</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="John Doe"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-row-grid">
                        <div className="input-group">
                          <label>Expiration Date</label>
                          <input 
                            type="text" 
                            className="input-premium"
                            placeholder="MM/YY"
                            maxLength="5"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            required
                          />
                        </div>
                        <div className="input-group">
                          <label>CVV</label>
                          <input 
                            type="password" 
                            className="input-premium"
                            placeholder="•••"
                            maxLength="3"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "UPI" && (
                    <div className="upi-payment-form animate-fade">
                      <div className="qr-box">
                        <FaQrcode className="qr-scan-placeholder" />
                        <p>Scan QR code with any UPI app to pay</p>
                      </div>
                      <div className="input-group">
                        <label>Or enter UPI ID</label>
                        <input 
                          type="text" 
                          className="input-premium"
                          placeholder="username@okaxis"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "COD" && (
                    <div className="cod-payment-form animate-fade">
                      <p className="cod-info">📦 Cash on Delivery is selected. You will pay the delivery executive once the package arrives at your shipping address.</p>
                    </div>
                  )}

                  <div className="payment-navigation-btns">
                    <button className="btn-secondary" onClick={() => setStep(1)}>
                      Back to Address
                    </button>
                    <button className="btn-premium" onClick={handlePlaceOrder} disabled={loading}>
                      {loading ? <div className="spinner"></div> : "Place Order"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Order Summary */}
            <div className="checkout-summary-panel">
              <h3>Order Summary</h3>
              <div className="summary-items-list">
                {cart.map(item => (
                  <div key={item.id} className="summary-item">
                    <img src={item.imageUrl} alt={item.productName} />
                    <div className="summary-item-details">
                      <h5>{item.productName}</h5>
                      <span>₹{item.price} &times; {item.quantity}</span>
                    </div>
                    <b>₹{item.price * item.quantity}</b>
                  </div>
                ))}
              </div>

              <hr />

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <input 
                  type="text" 
                  placeholder="Promo Code (WELCOME10)" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                <button type="submit" disabled={couponApplied}>
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </form>
              {couponError && <p className="coupon-error">{couponError}</p>}
              {couponApplied && <p className="coupon-success">Discount applied!</p>}

              <hr />

              <div className="summary-math">
                <div className="math-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {couponApplied && (
                  <div className="math-row discount">
                    <span>Discount</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="math-row">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="math-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <b style={{color: "var(--success-color)"}}>FREE</b> : `₹${shipping}`}</span>
                </div>
                <hr />
                <div className="math-row total-row">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 3 Success Page */
          <div className="checkout-success-view animate-fade">
            <FaCheckCircle className="success-icon" />
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for shopping with easybuy! Your payment has been processed and your order is being packed.</p>
            
            {placedOrder && (
              <div className="success-details-card">
                <div className="detail-line">
                  <span>Order Reference ID:</span>
                  <b>#{placedOrder.id}</b>
                </div>
                <div className="detail-line">
                  <span>Amount Paid:</span>
                  <b>₹{placedOrder.totalAmount}</b>
                </div>
                <div className="detail-line">
                  <span>Payment Reference ID:</span>
                  <b>{placedOrder.paymentId}</b>
                </div>
                <div className="detail-line">
                  <span>Status:</span>
                  <span className="badge-placed">ORDER {placedOrder.status}</span>
                </div>
              </div>
            )}

            <div className="success-actions">
              <button className="btn-premium" onClick={() => navigate("/orders")}>
                View Order History
              </button>
              <button className="btn-secondary" onClick={() => navigate("/products")}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

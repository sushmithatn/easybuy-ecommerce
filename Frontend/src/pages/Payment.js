import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaChevronRight, 
  FaArrowLeft, 
  FaCreditCard, 
  FaMobileAlt, 
  FaUniversity, 
  FaMoneyBillWave,
  FaCheckCircle,
  FaLock
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Payment.css";
import { API_URL } from "../config.js";

export default function Payment() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const [step, setStep] = useState(1); // 1: Shipping/Location, 2: Payment Method, 3: Success

  // Shipping Form States
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Payment Form States: "CARD" | "UPI" | "NETBANKING" | "COD"
  const [paymentMethod, setPaymentMethod] = useState("CARD");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardAmount, setCardAmount] = useState("");

  // UPI details
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("Google Pay");
  const [upiAmount, setUpiAmount] = useState("");

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [netbankingAmount, setNetbankingAmount] = useState("");

  // Order summary and success states
  const [cartTotal, setCartTotal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Fetch saved addresses & cart total from correct backend API
  useEffect(() => {
    if (!token || !username) {
      alert("Please login again");
      navigate("/login");
      return;
    }

    axios.get(`${API_URL}/api/users/addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSavedAddresses(res.data))
    .catch(err => console.error("Error loading addresses:", err));

    // Fetch user cart directly from GET /api/cart
    axios.get(`${API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const items = res.data || [];
      const subtotal = items.reduce((sum, i) => sum + (i.price || i.product?.price || 0) * i.quantity, 0);
      const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 150;
      const tax = subtotal * 0.18;
      const calculatedTotal = Math.round(subtotal + shipping + tax);
      
      setCartTotal(calculatedTotal);
      const strTotal = calculatedTotal ? String(calculatedTotal) : "";
      setCardAmount(strTotal);
      setUpiAmount(strTotal);
      setNetbankingAmount(strTotal);
    })
    .catch(err => console.error("Error loading cart total:", err));
  }, [token, username, navigate]);

  // Keep amounts in sync with cart total if it updates
  useEffect(() => {
    if (cartTotal > 0) {
      const strTotal = String(cartTotal);
      setCardAmount(prev => prev ? prev : strTotal);
      setUpiAmount(prev => prev ? prev : strTotal);
      setNetbankingAmount(prev => prev ? prev : strTotal);
    }
  }, [cartTotal]);

  const handleSelectAddress = (e) => {
    const addrId = e.target.value;
    if (!addrId) return;

    const selected = savedAddresses.find(a => String(a.id) === String(addrId));
    if (selected) {
      setStreet(selected.street || "");
      setCity(selected.city || "");
      setState(selected.state || "");
      setZipCode(selected.zipCode || "");
      setCountry(selected.country || "India");
      setPhoneNumber(selected.phoneNumber || "");
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!street || !city || !state || !zipCode || !country || !phoneNumber) {
      alert("Please fill all shipping details 📍");
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    if (!token || !username) {
      alert("Please login again");
      return;
    }

    // Input validation based on selected payment method
    if (paymentMethod === "CARD") {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        alert("Please enter all card details 💳");
        return;
      }
    } else if (paymentMethod === "UPI") {
      if (!upiId) {
        alert("Please enter a valid UPI ID 📱");
        return;
      }
    } else if (paymentMethod === "NETBANKING") {
      if (!bankAccountNo || !ifscCode) {
        alert("Please enter Account Number and IFSC Code for Net Banking 🏦");
        return;
      }
    }

    setIsProcessing(true);

    try {
      let displayMethodName = "Card Payment";
      if (paymentMethod === "CARD") displayMethodName = `Credit/Debit Card (₹${cardAmount || cartTotal})`;
      if (paymentMethod === "UPI") displayMethodName = `UPI (${selectedUpiApp} - ${upiId}, ₹${upiAmount || cartTotal})`;
      if (paymentMethod === "NETBANKING") displayMethodName = `Net Banking (${selectedBank} Bank - Acc: ${bankAccountNo}, IFSC: ${ifscCode}, ₹${netbankingAmount || cartTotal})`;
      if (paymentMethod === "COD") displayMethodName = "Cash on Delivery";

      const payload = {
        paymentMethod: displayMethodName,
        shippingStreet: street,
        shippingCity: city,
        shippingState: state,
        shippingZipCode: zipCode,
        shippingCountry: country,
        shippingPhone: phoneNumber
      };

      const res = await axios.post(
        `${API_URL}/api/orders/pay/${username}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setPlacedOrder(res.data);
      setStep(3); // Navigate to Success Screen
    } catch (error) {
      console.error("PAYMENT ERROR 👉", error.response || error);
      alert(error.response?.data?.message || "Payment processing failed ❌");
    } finally {
      setIsProcessing(false);
    }
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + "/" + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  return (
    <>
      <Navbar />

      <div className="payment-page-container">
        {/* Stepper Navigation */}
        <div className="payment-stepper">
          <div className={`step-node ${step >= 1 ? "active" : ""}`}>
            <span className="step-badge">1</span>
            <span className="step-txt">Location</span>
          </div>
          <FaChevronRight className="step-arrow-icon" />
          <div className={`step-node ${step >= 2 ? "active" : ""}`}>
            <span className="step-badge">2</span>
            <span className="step-txt">Payment</span>
          </div>
          <FaChevronRight className="step-arrow-icon" />
          <div className={`step-node ${step >= 3 ? "active" : ""}`}>
            <span className="step-badge">3</span>
            <span className="step-txt">Success</span>
          </div>
        </div>

        <div className="payment-content-card animate-fade">
          {/* STEP 1: Shipping Location */}
          {step === 1 && (
            <div className="shipping-section animate-fade">
              <div className="section-header">
                <h2>📍 Shipping Location</h2>
                {savedAddresses.length > 0 && (
                  <select className="address-dropdown" onChange={handleSelectAddress}>
                    <option value="">Choose Saved Address</option>
                    {savedAddresses.map(a => (
                      <option key={a.id} value={a.id}>{a.street}, {a.city}</option>
                    ))}
                  </select>
                )}
              </div>

              <form onSubmit={handleShippingSubmit} className="premium-form">
                <div className="input-field-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    className="premium-input-box"
                    placeholder="123 Shopping Lane, Apt 4B"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>

                <div className="input-fields-row">
                  <div className="input-field-group">
                    <label>City</label>
                    <input
                      type="text"
                      className="premium-input-box"
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-field-group">
                    <label>State</label>
                    <input
                      type="text"
                      className="premium-input-box"
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-fields-row">
                  <div className="input-field-group">
                    <label>Zip Code</label>
                    <input
                      type="text"
                      className="premium-input-box"
                      placeholder="400001"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-field-group">
                    <label>Country</label>
                    <input
                      type="text"
                      className="premium-input-box"
                      placeholder="India"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="premium-input-box"
                    placeholder="9999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="action-btn-premium">
                  Continue to Payment <FaChevronRight className="btn-icon-right" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Simple Online Payment UI */}
          {step === 2 && (
            <div className="payment-section animate-fade">
              <button type="button" className="back-link-btn" onClick={() => setStep(1)}>
                <FaArrowLeft /> Back to Location
              </button>

              <div className="payment-header-row">
                <h2 className="payment-heading">💳 Select Payment Method</h2>
                {cartTotal > 0 && (
                  <span className="pay-amount-badge">Total: ₹{cartTotal.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Payment Method Selector Grid */}
              <div className="payment-methods-grid">
                <button
                  type="button"
                  className={`method-tab-card ${paymentMethod === "CARD" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("CARD")}
                >
                  <FaCreditCard className="method-tab-icon" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  className={`method-tab-card ${paymentMethod === "UPI" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  <FaMobileAlt className="method-tab-icon" />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  className={`method-tab-card ${paymentMethod === "NETBANKING" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("NETBANKING")}
                >
                  <FaUniversity className="method-tab-icon" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  className={`method-tab-card ${paymentMethod === "COD" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("COD")}
                >
                  <FaMoneyBillWave className="method-tab-icon" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Sub-form based on selected payment method */}
              <form onSubmit={handlePaymentSubmit} className="payment-subform animate-fade">
                {/* 1. Credit / Debit Card */}
                {paymentMethod === "CARD" && (
                  <div className="card-subform">
                    <div className="input-field-group">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        className="premium-input-box"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        className="premium-input-box"
                        placeholder="4532 1234 5678 9101"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        maxLength="19"
                        required
                      />
                    </div>

                    <div className="input-fields-row">
                      <div className="input-field-group">
                        <label>Expiry (MM/YY)</label>
                        <input
                          type="text"
                          className="premium-input-box"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="input-field-group">
                        <label>CVV Code</label>
                        <input
                          type="password"
                          className="premium-input-box"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label>Amount (₹)</label>
                      <input
                        type="text"
                        className="premium-input-box"
                        placeholder={cartTotal ? String(cartTotal) : "0"}
                        value={cardAmount || (cartTotal ? String(cartTotal) : "")}
                        onChange={(e) => setCardAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 2. UPI / QR */}
                {paymentMethod === "UPI" && (
                  <div className="upi-subform">
                    <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Select Popular App
                    </label>
                    <div className="upi-app-pills">
                      {["Google Pay", "PhonePe", "Paytm", "BHIM UPI"].map((app) => (
                        <button
                          key={app}
                          type="button"
                          className={`upi-pill-btn ${selectedUpiApp === app ? "active" : ""}`}
                          onClick={() => setSelectedUpiApp(app)}
                        >
                          {app}
                        </button>
                      ))}
                    </div>

                    <div className="input-field-group" style={{ marginTop: '12px' }}>
                      <label>UPI ID / VPA</label>
                      <input
                        type="text"
                        className="premium-input-box"
                        placeholder="example@upi or mobile@gpay"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>Amount (₹)</label>
                      <input
                        type="text"
                        className="premium-input-box"
                        placeholder={cartTotal ? String(cartTotal) : "0"}
                        value={upiAmount || (cartTotal ? String(cartTotal) : "")}
                        onChange={(e) => setUpiAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 3. Net Banking */}
                {paymentMethod === "NETBANKING" && (
                  <div className="netbanking-subform">
                    <label style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Popular Banks
                    </label>
                    <div className="banks-grid">
                      {["SBI", "HDFC", "ICICI", "Axis", "Kotak"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          className={`bank-tile-btn ${selectedBank === bank ? "active" : ""}`}
                          onClick={() => setSelectedBank(bank)}
                        >
                          {bank} Bank
                        </button>
                      ))}
                    </div>

                    <div className="input-field-group" style={{ marginTop: '14px' }}>
                      <label>Account Number</label>
                      <input
                        type="text"
                        className="premium-input-box"
                        placeholder="e.g. 123456789012"
                        value={bankAccountNo}
                        onChange={(e) => setBankAccountNo(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>

                    <div className="input-fields-row">
                      <div className="input-field-group">
                        <label>IFSC Code</label>
                        <input
                          type="text"
                          className="premium-input-box"
                          placeholder="e.g. SBIN0001234"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          required
                        />
                      </div>

                      <div className="input-field-group">
                        <label>Amount (₹)</label>
                        <input
                          type="text"
                          className="premium-input-box"
                          placeholder={cartTotal ? String(cartTotal) : "0"}
                          value={netbankingAmount || (cartTotal ? String(cartTotal) : "")}
                          onChange={(e) => setNetbankingAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Cash on Delivery */}
                {paymentMethod === "COD" && (
                  <div className="cod-info-box">
                    <p>📦 <b>Cash on Delivery</b> selected. You will pay the delivery agent upon receiving your package at your address.</p>
                  </div>
                )}

                <div className="secure-badge-note">
                  <FaLock /> 256-Bit SSL Encrypted & Secured Payment
                </div>

                <button 
                  type="submit" 
                  className="action-btn-premium pay-btn-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    "Processing Order..."
                  ) : paymentMethod === "COD" ? (
                    "Confirm COD Order"
                  ) : (
                    "Pay & Complete Order"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Order Confirmation Success */}
          {step === 3 && (
            <div className="success-section animate-fade">
              <div className="success-animation-container">
                <FaCheckCircle style={{ fontSize: '64px', color: 'var(--success-color)' }} />
              </div>

              <h2 className="success-title">Order Placed Successfully! 🎉</h2>
              <p className="success-subtitle">
                Thank you for shopping with us! Your order has been placed and is being prepared.
              </p>

              {placedOrder && (
                <div className="order-receipt-card">
                  <div className="receipt-row">
                    <span>Order Reference ID:</span>
                    <strong>#{placedOrder.id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Total Amount:</span>
                    <strong>₹{placedOrder.totalAmount?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Method:</span>
                    <strong>{placedOrder.paymentMethod}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Payment Status:</span>
                    <span className="success-badge">{placedOrder.paymentStatus || "SUCCESS"}</span>
                  </div>
                </div>
              )}

              <div className="success-actions-row">
                <button
                  type="button"
                  className="action-btn-premium view-orders-btn"
                  onClick={() => navigate("/orders")}
                >
                  View Order History
                </button>
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() => navigate("/products")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

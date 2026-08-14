import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChevronRight, FaArrowLeft } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Payment.css";
import { API_URL } from "../config.js";

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  // Order success state
  const [placedOrder, setPlacedOrder] = useState(null);

  // Fetch saved addresses
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
  }, [token, username, navigate]);

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

  const handlePayment = async () => {
    try {
      if (!token || !username) {
        alert("Please login again");
        return;
      }

      if (paymentMethod === "COD") {
        const payload = {
          paymentMethod: "COD",
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
        setStep(3); // Go to Success Screen
      } else {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          alert("Razorpay SDK failed to load. Please check your internet connection.");
          return;
        }

        // 1. Create Razorpay Order on Backend
        const orderRes = await axios.post(
`${API_URL}/api/orders/razorpay/create`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

        // 2. Open Razorpay Checkout modal
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "EasyBuy E-Commerce",
          description: "Secure Order Payment",
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const verifyPayload = {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                shippingStreet: street,
                shippingCity: city,
                shippingState: state,
                shippingZipCode: zipCode,
                shippingCountry: country,
                shippingPhone: phoneNumber
              };

              const verificationRes = await axios.post(
`${API_URL}/api/orders/razorpay/verify`,
                verifyPayload,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                }
              );

              setPlacedOrder(verificationRes.data);
              setStep(3); // Success Screen
            } catch (err) {
              console.error("Verification error 👉", err);
              alert(err.response?.data?.message || "Payment verification failed ❌");
            }
          },
          prefill: {
            name: username,
            contact: phoneNumber
          },
          theme: {
            color: "#6366f1"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("PAYMENT ERROR 👉", error.response || error);
      alert(error.response?.data?.message || "Payment failed ❌");
    }
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

          {step === 2 && (
            <div className="payment-section animate-fade">
              <button type="button" className="back-link-btn" onClick={() => setStep(1)}>
                <FaArrowLeft /> Back to Location
              </button>

              <h2 className="payment-heading">💳 Select Payment Method</h2>

              <div className="payment-options">
                <label className="payment-radio-label">
                  <input
                    type="radio"
                    value="RAZORPAY"
                    checked={paymentMethod === "RAZORPAY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Online Payment (Razorpay - Card, UPI, Netbanking)</span>
                </label>

                <label className="payment-radio-label">
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              {paymentMethod === "RAZORPAY" && (
                <div className="cod-payment-form animate-fade">
                  <p className="cod-info" style={{ borderLeftColor: "var(--primary-color)" }}>
                    💳 Secure payment powered by Razorpay. You can pay using Credit/Debit Card, UPI (Google Pay, PhonePe, Paytm), Netbanking, or Wallets.
                  </p>
                </div>
              )}

              {paymentMethod === "COD" && (
                <div className="cod-payment-form animate-fade">
                  <p className="cod-info">📦 Cash on Delivery is selected. You will pay the delivery executive once the package arrives at your shipping address.</p>
                </div>
              )}

              <button type="button" className="action-btn-premium pay-btn-primary" onClick={handlePayment}>
                {paymentMethod === "RAZORPAY" ? "Open Razorpay Checkout" : "Confirm COD Order"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="success-section animate-fade">
              <div className="success-animation-container">
                <div className="checkmark-circle">
                  <div className="checkmark"></div>
                </div>
              </div>

              <h2 className="success-title">Order Placed Successfully! 🎉</h2>
              <p className="success-subtitle">
                Thank you for shopping with us! Your order has been placed and is being processed.
              </p>

              {placedOrder && (
                <div className="order-receipt-card">
                  <div className="receipt-row">
                    <span>Order Reference ID:</span>
                    <strong>#{placedOrder.id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Amount Paid:</span>
                    <strong>₹{placedOrder.totalAmount}</strong>
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

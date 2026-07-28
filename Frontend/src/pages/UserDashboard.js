import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBoxOpen, FaMapMarkerAlt, FaLock, FaCalendarAlt, FaDownload, FaMapPin, FaTrash } from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./UserDashboard.css";
import { API_URL } from "../config";

export default function UserDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("profile");

  // Profile data states
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    username: ""
  });
  const [profileMsg, setProfileMsg] = useState("");

  // Saved Addresses states
  const [addresses, setAddresses] = useState([]);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [addressMsg, setAddressMsg] = useState("");

  // Change Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");

  // Order history states
  const [orders, setOrders] = useState([]);

  // Printable Invoice state
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch initial profile, addresses, and orders
  const loadProfile = useCallback(() => {
    axios.get(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setProfile(res.data))
    .catch(err => console.error(err));
  }, [token]);

  const loadAddresses = useCallback(() => {
 axios.get(`${API_URL}/api/users/addresses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAddresses(res.data))
    .catch(err => console.error(err));
  }, [token]);

  const loadOrders = useCallback(() => {
    axios.get(`${API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
    loadAddresses();
    loadOrders();
  }, [token, navigate, loadProfile, loadAddresses, loadOrders]);

  // Update Profile Submit
  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileMsg("");

   axios.put(`${API_URL}/api/users/profile`, profile, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setProfile(res.data);
      setProfileMsg("Profile updated successfully ✅");
    })
    .catch(err => setProfileMsg("Failed to update profile ❌"));
  };

  // Add Address Submit
  const handleAddAddress = (e) => {
    e.preventDefault();
    setAddressMsg("");

    const payload = { street, city, state, zipCode, country, phoneNumber: phone };

    axios.post(`${API_URL}/api/users/addresses`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setAddressMsg("Address added successfully ✅");
      setStreet("");
      setCity("");
      setState("");
      setZipCode("");
      setCountry("");
      setPhone("");
      loadAddresses();
    })
    .catch(err => setAddressMsg("Failed to add address ❌"));
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
  axios.delete(`${API_URL}/api/users/addresses/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      loadAddresses();
    })
    .catch(err => console.error(err));
  };

  // Change Password Submit
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassError("");

  axios.put(`${API_URL}/api/users/change-password`, { oldPassword, newPassword },  {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setPassMsg("Password updated successfully ✅");
      setOldPassword("");
      setNewPassword("");
    })
    .catch(err => setPassError(err.response?.data?.message || "Failed to update password ❌"));
  };

  // Trigger Invoice Print Window
  const handlePrintInvoice = (order) => {
    setSelectedInvoice(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <div className="dashboard-container">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-profile-summary">
            <div className="summary-avatar">{profile.fullName ? profile.fullName.charAt(0) : "U"}</div>
            <h3>{profile.fullName || "User Account"}</h3>
            <p>@{profile.username}</p>
          </div>
          
          <ul className="sidebar-nav-links">
            <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
              <FaUser /> My Profile
            </li>
            <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>
              <FaBoxOpen /> Order History
            </li>
            <li className={activeTab === "addresses" ? "active" : ""} onClick={() => setActiveTab("addresses")}>
              <FaMapMarkerAlt /> Saved Addresses
            </li>
            <li className={activeTab === "password" ? "active" : ""} onClick={() => setActiveTab("password")}>
              <FaLock /> Change Password
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-content-panel">
          {activeTab === "profile" && (
            <div className="dashboard-card animate-fade">
              <h2>My Profile</h2>
              <p className="subtitle">Manage and update your account details</p>
              
              {profileMsg && <div className="dashboard-alert">{profileMsg}</div>}
              
              <form onSubmit={handleUpdateProfile} className="dashboard-form">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="input-premium"
                    value={profile.fullName || ""}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="input-row-grid">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="input-premium"
                      value={profile.email || ""}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      className="input-premium"
                      value={profile.phoneNumber || ""}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-premium dashboard-submit-btn">
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="dashboard-card animate-fade">
              <h2>Order History</h2>
              <p className="subtitle">Track and review your past purchases</p>

              {orders.length > 0 ? (
                <div className="orders-timeline-list">
                  {orders.map(order => (
                    <div key={order.id} className="timeline-order-item">
                      <div className="order-item-header">
                        <div>
                          <h4>Order ID: #{order.id}</h4>
                          <span className="order-date">
                            <FaCalendarAlt /> {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="header-right">
                          <b className="order-price">₹{order.totalAmount}</b>
                          <button 
                            className="btn-print-invoice"
                            onClick={() => handlePrintInvoice(order)}
                          >
                            <FaDownload /> Invoice
                          </button>
                        </div>
                      </div>

                      {/* Timeline Tracking Indicator */}
                      <div className="order-tracking-timeline">
                        <div className="timeline-step active">
                          <span className="dot"></span>
                          <span className="label">Placed</span>
                        </div>
                        <div className={`timeline-step ${(order.status === "SHIPPED" || order.status === "DELIVERED") ? "active" : ""}`}>
                          <span className="dot"></span>
                          <span className="label">Shipped</span>
                        </div>
                        <div className={`timeline-step ${order.status === "DELIVERED" ? "active" : ""}`}>
                          <span className="dot"></span>
                          <span className="label">Delivered</span>
                        </div>
                      </div>

                      <div className="order-items-grid">
                        {order.items && order.items.map(item => (
                          <div key={item.id} className="mini-order-card">
                            <img src={item.imageUrl} alt={item.productName} />
                            <div>
                              <h5>{item.productName}</h5>
                              <span>₹{item.price} &times; {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No orders placed yet.</p>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="dashboard-card animate-fade">
              <h2>Saved Addresses</h2>
              <p className="subtitle">Add or edit your shipping and billing details</p>

              <div className="addresses-section-grid">
                {/* Add Address Form */}
                <form onSubmit={handleAddAddress} className="dashboard-form address-form-inline">
                  <h3>Add Address</h3>
                  
                  {addressMsg && <div className="dashboard-alert">{addressMsg}</div>}

                  <div className="input-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="123 Main St"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-row-grid">
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-row-grid">
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="Zip Code"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="input-premium"
                      placeholder="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    />
                  </div>

                  <input
                    type="tel"
                    className="input-premium"
                    placeholder="Contact Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <button type="submit" className="btn-premium">Add Address</button>
                </form>

                {/* Addresses List */}
                <div className="addresses-list-panel">
                  <h3>Saved Address Cards</h3>
                  {addresses.length > 0 ? (
                    <div className="address-cards-grid">
                      {addresses.map(a => (
                        <div key={a.id} className="address-card-summary">
                          <FaMapPin className="pin-icon" />
                          <div className="address-body">
                            <p><b>{a.street}</b></p>
                            <p>{a.city}, {a.state} - {a.zipCode}</p>
                            <p>{a.country}</p>
                            <p className="phone">📞 {a.phoneNumber}</p>
                          </div>
                          <button className="btn-delete-address" onClick={() => handleDeleteAddress(a.id)}>
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No saved addresses yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="dashboard-card animate-fade">
              <h2>Change Password</h2>
              <p className="subtitle">Ensure your account remains safe by updating details</p>

              {passMsg && <div className="dashboard-alert">{passMsg}</div>}
              {passError && <div className="dashboard-alert error">{passError}</div>}

              <form onSubmit={handleChangePassword} className="dashboard-form max-width-small">
                <div className="input-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    className="input-premium"
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="input-premium"
                    placeholder="Create strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-premium dashboard-submit-btn">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Hidden Printable Invoice Section */}
      {selectedInvoice && (
        <div id="printable-invoice">
          <div className="invoice-header">
            <div>
              <h1>easybuy INVOICE</h1>
              <p>📍 123 E-Commerce Blvd, San Jose, CA, USA</p>
              <p>✉️ billing@easybuy.com</p>
            </div>
            <div className="invoice-meta-right">
              <h3>Order ID: #{selectedInvoice.id}</h3>
              <p>Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
              <p>Payment Mode: {selectedInvoice.paymentMethod}</p>
              <p>Reference: {selectedInvoice.paymentId}</p>
            </div>
          </div>
          
          <hr />

          <div className="invoice-billing-row">
            <div>
              <h4>Billed To:</h4>
              <p><b>{profile.fullName}</b></p>
              <p>Email: {profile.email}</p>
              <p>Phone: {profile.phoneNumber}</p>
            </div>
            <div>
              <h4>Shipping Destination:</h4>
              <p>{selectedInvoice.shippingStreet}</p>
              <p>{selectedInvoice.shippingCity}, {selectedInvoice.shippingState} - {selectedInvoice.shippingZipCode}</p>
              <p>{selectedInvoice.shippingCountry}</p>
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.items && selectedInvoice.items.map(item => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-totals-box">
            <div className="total-line-item">
              <span>Tax (GST 18%):</span>
              <b>₹{selectedInvoice.tax?.toFixed(2) || "0.00"}</b>
            </div>
            <div className="total-line-item">
              <span>Shipping Fee:</span>
              <b>₹{selectedInvoice.shippingFee || "0.00"}</b>
            </div>
            <div className="total-line-item">
              <span>Discount Applied:</span>
              <b>- ₹{selectedInvoice.discountAmount?.toFixed(2) || "0.00"}</b>
            </div>
            <hr />
            <div className="total-line-item grand-total">
              <span>Grand Total:</span>
              <span>₹{selectedInvoice.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div className="invoice-footer">
            <p>Thank you for buying from easybuy! This is a computer generated invoice document.</p>
          </div>
        </div>
      )}
    </div>
  );
}

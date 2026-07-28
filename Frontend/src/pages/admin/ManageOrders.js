import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "./ManageOrders.css";
import { FaCalendarAlt, FaEdit } from "react-icons/fa";
import { API_URL } from "../../config";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const loadOrders = useCallback(() => {
    setLoading(true);
   axios.get(`${API_URL}/api/orders/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error("Error loading orders:", err))
    .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = (orderId, newStatus) => {
    axios.put(
      `${API_URL}/api/orders/admin/${orderId}?status=${newStatus}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(loadOrders)
    .catch(err => {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update order status");
    });
  };

  return (
    <div className="admin-wrapper animate-fade">
      <AdminNavbar />

      <div className="admin-orders-container">
        <h2>Manage Orders</h2>
        <p className="admin-subtitle">Track and update customer order fulfillment statuses</p>

        <div className="orders-list-panel">
          {loading ? (
            <div className="spinner-center"><div className="spinner"></div></div>
          ) : orders.length > 0 ? (
            <div className="orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer Name</th>
                    <th>Products</th>
                    <th>Total Amount</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                    <th className="actions-cell">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <span className="order-date">
                          <FaCalendarAlt className="calendar-icon" /> {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div className="cust-cell">
                          <b>{order.userFullName || order.username}</b>
                          <span>@{order.username}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-order-products">
                          {order.items && order.items.map(item => (
                            <div key={item.id} className="admin-order-product-thumb" title={`${item.productName} (x${item.quantity})`}>
                              <img src={item.imageUrl} alt={item.productName} />
                              <span className="thumb-qty">{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td><b>₹{order.totalAmount}</b></td>
                      <td>{order.paymentMethod}</td>
                      <td>
                        <span className={`status-badge ${order.status === "CANCELLED_BY_CUSTOMER" ? "cancelled" : order.status.toLowerCase()}`}>
                          {order.status === "CANCELLED_BY_CUSTOMER" ? "CANCELLED BY CUSTOMER" : order.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        {order.status === "CANCELLED_BY_CUSTOMER" ? (
                          <span className="cancelled-action-label" style={{ color: "var(--error-color)", fontWeight: "700", fontSize: "13px" }}>Cancelled by Customer</span>
                        ) : order.status === "CANCELLED" ? (
                          <span className="cancelled-action-label" style={{ color: "var(--text-muted)", fontWeight: "700", fontSize: "13px" }}>Cancelled</span>
                        ) : (
                          <div className="status-selector-box">
                            <FaEdit className="edit-icon" />
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              className="status-select-dropdown"
                            >
                              <option value="PLACED">PLACED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No customer orders placed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Orders.css";
import { API_URL } from "../config";
export default function Orders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username || !token) return;

    axios
.get(`${API_URL}/api/orders?username=${username}`, {
          headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        console.log("Orders API response:", res.data);

        // 🔒 SAFETY: ensure orders is always an array
        const data = res.data;
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setOrders([]);
        }
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setOrders([]);
      });
  }, [username, token]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? 📦")) return;

    try {
      const res = await axios.put(
       `${API_URL}/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update state with cancelled order
      setOrders(prevOrders =>
        prevOrders.map(order => (order.id === orderId ? res.data : order))
      );
      alert("Order cancelled successfully! ✅");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert(err.response?.data?.message || "Failed to cancel order ❌");
    }
  };

  return (
    <>
      <Navbar />

      <div className="orders-page">
        <h2>📦 My Orders</h2>

        {orders.length === 0 ? (
          <p className="no-orders">No orders found</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-box">
              <h4>Order ID: #{order.id}</h4>

              <p>
                <b>Status:</b>{" "}
                <span className={`status-badge status-${order.status === "CANCELLED_BY_CUSTOMER" ? "CANCELLED" : order.status}`}>
                  {order.status === "CANCELLED_BY_CUSTOMER" ? "CANCELLED" : order.status}
                </span>
              </p>

              <p>
                <b>Total Amount:</b> ₹{order.totalAmount}
              </p>

              {(order.status === "PLACED" || order.status === "PENDING") && (
                <button
                  type="button"
                  className="btn-cancel-order"
                  onClick={() => handleCancelOrder(order.id)}
                >
                  Cancel Order
                </button>
              )}

              <hr />

              {order.items &&
                order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                    />

                    <div className="order-item-details">
                      <h5>{item.productName}</h5>
                      <p>
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}

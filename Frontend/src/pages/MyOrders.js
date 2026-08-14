import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./MyOrders.css";
import { API_URL } from "../config.js";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) return;

    axios
.get(`${API_URL}/api/orders?username=${username}`, {
          headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));
  }, [username, token]);

  return (
    <>
      <Navbar />

      <div className="my-orders-container">
        <h2>📦 My Orders</h2>

        {orders.length === 0 ? (
          <p className="no-orders">No orders found</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h4>Order ID: #{order.id}</h4>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>

              <p className="order-total">
                <b>Total:</b> ₹{order.totalAmount}
              </p>

              <hr />

              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <img src={item.imageUrl} alt={item.productName} />

                  <div>
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

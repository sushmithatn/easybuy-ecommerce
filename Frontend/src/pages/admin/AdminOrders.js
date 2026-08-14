import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config.js";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  const loadOrders = () => {
    axios.get(`${API_URL}/api/orders/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data))
    .catch(err => console.error("Error loading orders:", err));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/api/orders/admin/${id}?status=${status}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      loadOrders();

    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Manage Orders</h2>

      {orders.map(o => (
        <div 
          key={o.id} 
          style={{ 
            border: "1px solid #ccc", 
            margin: "10px", 
            padding: "10px" 
          }}
        >
          <p><b>User:</b> {o.username}</p>
          <p><b>Total:</b> ₹{o.totalAmount}</p>
          <p><b>Status:</b> {o.status}</p>

          <select 
            value={o.status}
            onChange={(e) => updateStatus(o.id, e.target.value)}
          >
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>

        </div>
      ))}
    </div>
  );
}
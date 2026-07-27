import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:8080/api/orders/admin", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setOrders(res.data));
  }, []);

  const updateStatus = (id, status) => {
    axios.put(
      `http://localhost:8080/api/orders/admin/${id}?status=${status}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(() => window.location.reload());
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Manage Orders</h2>

      {orders.map(o => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <p><b>User:</b> {o.username}</p>
          <p><b>Total:</b> ₹{o.totalAmount}</p>
          <p><b>Status:</b> {o.status}</p>

          <select onChange={e => updateStatus(o.id, e.target.value)}>
            <option>PLACED</option>
            <option>CONFIRMED</option>
            <option>SHIPPED</option>
            <option>DELIVERED</option>
          </select>
        </div>
      ))}
    </div>
  );
}

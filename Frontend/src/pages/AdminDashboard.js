import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import "../pages/admin/AdminDashboard.css";
import { FaBoxOpen, FaShoppingBag, FaDollarSign, FaUsers } from "react-icons/fa";
import { API_URL } from "../config";

export default function AdminDashboard() {
  const [productsCount, setProductsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0
  });
  
  const token = localStorage.getItem("token");

  const loadData = useCallback(async () => {
    try {
      // 1. Get products count
const prodRes = await axios.get(`${API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setProductsCount(prodRes.data.totalElements || 0);

      // 2. Get categories count
const catRes = await axios.get(`${API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setCategoriesCount(catRes.data.length || 0);

      // 3. Get analytics (orders count & revenue)
const analyticsRes = await axios.get(`${API_URL}/api/orders/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to load admin analytics:", err);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mock Sales Analytics Chart Data
  const chartData = [
    { label: "Mon", sales: 2400 },
    { label: "Tue", sales: 1398 },
    { label: "Wed", sales: 9800 },
    { label: "Thu", sales: 3908 },
    { label: "Fri", sales: 4800 },
    { label: "Sat", sales: 3800 },
    { label: "Sun", sales: 4300 }
  ];

  const maxSales = Math.max(...chartData.map(d => d.sales));

  return (
    <div className="admin-wrapper animate-fade">
      <AdminNavbar />

      <div className="admin-dashboard-container">
        <h1 className="admin-title">Dashboard Overview</h1>
        <p className="admin-subtitle">Real-time store stats and business overview</p>

        {/* METRICS CARDS GRID */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box blue">
              <FaDollarSign />
            </div>
            <div className="metric-info">
              <span>Total Revenue</span>
              <h2>₹{analytics.totalRevenue}</h2>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box green">
              <FaShoppingBag />
            </div>
            <div className="metric-info">
              <span>Total Orders</span>
              <h2>{analytics.totalOrders}</h2>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box purple">
              <FaBoxOpen />
            </div>
            <div className="metric-info">
              <span>Total Products</span>
              <h2>{productsCount}</h2>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box gold">
              <FaUsers />
            </div>
            <div className="metric-info">
              <span>Categories</span>
              <h2>{categoriesCount}</h2>
            </div>
          </div>
        </div>

        {/* ANALYTICS CHARTS SECTION */}
        <div className="admin-charts-section">
          <div className="chart-card">
            <h3>Sales Trend (Weekly)</h3>
            <p className="chart-subtitle">Demonstrating daily store checkout revenue rates</p>
            
            {/* Custom Interactive SVG Bar Chart */}
            <div className="custom-svg-chart">
              <svg viewBox="0 0 600 250" width="100%" height="100%">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="40" y1="70" x2="580" y2="70" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="40" y1="120" x2="580" y2="120" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="40" y1="170" x2="580" y2="170" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="4" />
                <line x1="40" y1="220" x2="580" y2="220" stroke="var(--border-color)" strokeWidth="1" />

                {/* Bars */}
                {chartData.map((d, index) => {
                  const barWidth = 36;
                  const barGap = 40;
                  const chartHeight = 200; // max chart height from y=20 to y=220
                  const barHeight = (d.sales / maxSales) * chartHeight;
                  const x = 50 + index * (barWidth + barGap);
                  const y = 220 - barHeight;

                  return (
                    <g key={index} className="chart-bar-group">
                      {/* Gradient definition inside bar for beautiful glow */}
                      <defs>
                        <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--primary-color)" />
                          <stop offset="100%" stopColor="var(--primary-hover)" />
                        </linearGradient>
                      </defs>
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        fill={`url(#gradient-${index})`}
                        rx="4"
                        className="chart-bar"
                      />
                      {/* Hover value tooltip display */}
                      <text 
                        x={x + barWidth / 2} 
                        y={y - 8} 
                        textAnchor="middle" 
                        fill="var(--text-primary)" 
                        fontSize="10" 
                        fontWeight="700"
                        className="bar-value-text"
                      >
                        ₹{d.sales}
                      </text>
                      {/* Day Label */}
                      <text 
                        x={x + barWidth / 2} 
                        y="240" 
                        textAnchor="middle" 
                        fill="var(--text-secondary)" 
                        fontSize="12"
                        fontWeight="600"
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="dashboard-info-card">
            <h3>Store Information</h3>
            <p>Welcome to easybuy administrative panel. Use side nav controls to manage items, categories, and order parameters.</p>
            <ul className="admin-tips-list">
              <li>Check customer orders daily for processing schedules</li>
              <li>Keep inventory counts updated to avoid checkout stockout flags</li>
              <li>Toggle category items dynamically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

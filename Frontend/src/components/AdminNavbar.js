import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaShoppingBag,
  FaSignOutAlt,
  FaTags
} from "react-icons/fa";
import "../components/AdminNavbar.css";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-logo" onClick={() => navigate("/admin")}>
        <img src="/logo.png" alt="easybuy Logo" className="logo-img" />
        <span className="logo-text">easybuy</span>
        <span className="logo-badge">ADMIN</span>
      </div>

      <ul className="admin-nav-links">
        <li>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? "admin-nav-item active" : "admin-nav-item"
            }
            end
          >
            <FaTachometerAlt className="icon" /> Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              isActive ? "admin-nav-item active" : "admin-nav-item"
            }
          >
            <FaBoxOpen className="icon" /> Products
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              isActive ? "admin-nav-item active" : "admin-nav-item"
            }
          >
            <FaTags className="icon" /> Categories
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "admin-nav-item active" : "admin-nav-item"
            }
          >
            <FaShoppingBag className="icon" /> Orders
          </NavLink>
        </li>
      </ul>

      <button className="admin-logout-btn" onClick={logout}>
        <FaSignOutAlt className="icon" /> Logout
      </button>
    </nav>
  );
}

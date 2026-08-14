import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaSun, FaMoon, FaEnvelope } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import "./Login.css";
import { API_URL } from "../config.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", username);

      if (role === "ROLE_ADMIN") {
        navigate("/admin");
      } else {
        navigate("/products");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMessage("");

    if (!forgotEmail || !forgotEmail.includes("@")) {
      setForgotError("Please enter a valid email address");
      return;
    }

    setForgotMessage("Password reset link has been sent to your email! (Mockup)");
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotEmail("");
      setForgotMessage("");
    }, 3000);
  };

  return (
    <div className="auth-wrapper animate-fade">
      {/* Theme Toggler */}
      <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      <div className="auth-container">
        <div className="auth-brand">
          <img src="/logo.png" alt="easybuy Logo" className="logo-img" />
          <h1>easybuy</h1>
          <p>Your Premium Shopping Destination</p>
        </div>

        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to continue shopping</p>

          {error && <div className="error-message-box animate-fade">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username</label>
              <div className="input-box">
                <FaUser className="icon" />
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
                <span className="forgot-link" onClick={() => setShowForgotModal(true)}>
                  Forgot Password?
                </span>
              </div>
              <div className="input-box">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-premium auth-submit" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Login"}
            </button>
          </form>

          <p className="switch-text">
            Don’t have an account?{" "}
            <span className="switch-link" onClick={() => navigate("/register")}>
              Register here
            </span>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay animate-fade">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button className="close-btn" onClick={() => setShowForgotModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <p>Enter the email address associated with your account and we will send you a reset link.</p>
              
              {forgotError && <div className="error-message-box">{forgotError}</div>}
              {forgotMessage && <div className="success-message-box">{forgotMessage}</div>}

              <div className="input-group">
                <div className="input-box">
                  <FaEnvelope className="icon" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <button type="submit" className="btn-premium modal-submit">
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

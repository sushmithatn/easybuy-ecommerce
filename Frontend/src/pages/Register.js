import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaPhone, FaMoon, FaSun, FaCheck, FaTimes } from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Password Validation states
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@#$%^&+=!]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Please satisfy all password strength criteria");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username,
        password,
        email,
        fullName,
        phoneNumber,
      });

      alert("Registration successful ✅");
      navigate("/"); // Redirect to login
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Try a different username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper animate-fade">
      {/* Theme Toggle */}
      <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      <div className="auth-container register-container">
        <div className="auth-brand">
          <img src="/logo.png" alt="easybuy Logo" className="logo-img" />
          <h1>easybuy</h1>
          <p>Join our premium e-commerce marketplace</p>
        </div>

        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="subtitle">It only takes a minute to sign up</p>

          {error && <div className="error-message-box animate-fade">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-row-grid">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-box">
                  <FaIdCard className="icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Username</label>
                <div className="input-box">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    placeholder="johndoe12"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-row-grid">
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-box">
                  <FaEnvelope className="icon" />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <div className="input-box">
                  <FaPhone className="icon" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-box">
                <FaLock className="icon" />
                <input
                  type="password"
                  placeholder="Create strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                />
              </div>

              {/* Real-time Password Strength Criteria Panel */}
              {(isPasswordFocused || password.length > 0) && (
                <div className="password-checklist animate-fade">
                  <p className="checklist-title">Password must contain:</p>
                  <ul>
                    <li className={passwordStrength.length ? "valid" : "invalid"}>
                      {passwordStrength.length ? <FaCheck className="check-icon" /> : <FaTimes className="cross-icon" />}
                      At least 8 characters
                    </li>
                    <li className={passwordStrength.lowercase ? "valid" : "invalid"}>
                      {passwordStrength.lowercase ? <FaCheck className="check-icon" /> : <FaTimes className="cross-icon" />}
                      At least one lowercase letter
                    </li>
                    <li className={passwordStrength.uppercase ? "valid" : "invalid"}>
                      {passwordStrength.uppercase ? <FaCheck className="check-icon" /> : <FaTimes className="cross-icon" />}
                      At least one uppercase letter
                    </li>
                    <li className={passwordStrength.number ? "valid" : "invalid"}>
                      {passwordStrength.number ? <FaCheck className="check-icon" /> : <FaTimes className="cross-icon" />}
                      At least one digit (0-9)
                    </li>
                    <li className={passwordStrength.special ? "valid" : "invalid"}>
                      {passwordStrength.special ? <FaCheck className="check-icon" /> : <FaTimes className="cross-icon" />}
                      At least one special character (@#$%^&+=!)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button type="submit" className="btn-premium auth-submit" disabled={loading}>
              {loading ? <div className="spinner"></div> : "Sign Up"}
            </button>
          </form>

          <p className="switch-text">
            Already have an account?{" "}
            <span className="switch-link" onClick={() => navigate("/")}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

import { API_URL } from "../config";

export const formatImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) {
    return `${API_URL}${url}`;
  }
  return url;
};

/**
 * Handles API errors, specifically identifying HTTP 401/403 (Session Expired / Unauthorized)
 * and clearing invalid local storage state before redirecting to login.
 */
export const handleApiError = (err, navigate, fallbackMessage = "Operation failed") => {
  console.error("API Error:", err);

  const status = err.response?.status;
  const message = err.response?.data?.message || err.response?.data?.error;

  if (status === 401 || status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    alert("Your session has expired or is invalid. Please log in again 🔑");
    if (navigate) {
      navigate("/login");
    }
    return "Session expired";
  }

  const finalMsg = message && typeof message === "string" ? message : fallbackMessage;
  alert(finalMsg);
  return finalMsg;
};


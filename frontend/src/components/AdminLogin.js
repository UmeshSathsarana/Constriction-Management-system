import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

const AdminLogin = ({ setAuthUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/admin/login",
        {
          email,
          password,
        }
      );

      const { user, token } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      setAuthUser(user);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Cannot connect to server. Please make sure the backend is running."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form-wrapper">
        <div className="admin-badge">ADMIN</div>
        <h2 className="admin-login-title">
          Admin Login
        </h2>
        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-login-input"
              placeholder="admin@gmail.com"
            />
          </div>
          <div className="admin-login-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-login-input"
              placeholder="admin"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="admin-login-submit-btn"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="admin-login-credentials">
          <p>Default admin credentials:</p>
          <p>Email: <span className="admin-credential-email">admin@gmail.com</span></p>
          <p>Password: <span className="admin-credential-password">admin</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

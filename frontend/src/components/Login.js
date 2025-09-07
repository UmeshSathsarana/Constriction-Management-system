// components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ setAuthUser }) => {
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
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });

      const { user, token } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      setAuthUser(user);

      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Redirect based on role
      switch (user.role) {
        case "Admin":
          navigate("/admin/dashboard");
          break;
        case "Project Manager":
          navigate("/pm/dashboard");
          break;
        case "Site Supervisor":
          navigate("/supervisor/dashboard");
          break;
        case "Inventory Manager":
          navigate("/inventory/dashboard");
          break;
        case "Client":
          navigate("/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = [
    { role: "Admin", email: "admin@test.com", pass: "admin123" },
    { role: "Project Manager", email: "pm@test.com", pass: "pm123" },
    { role: "Site Supervisor", email: "supervisor@test.com", pass: "super123" },
    { role: "Inventory Manager", email: "inventory@test.com", pass: "inv123" },
  ];

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h2 className="login-title">
          Construction Management System
        </h2>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-credentials">
          <h4>Test Credentials:</h4>
          {testCredentials.map((cred, idx) => (
            <div key={idx} className="credential-item">
              <span className="credential-role">{cred.role}:</span>
              <span className="credential-details">{cred.email} / {cred.pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;

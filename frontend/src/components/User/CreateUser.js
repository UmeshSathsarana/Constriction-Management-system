// components/User/CreateUser.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const CreateUser = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "Worker",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post("http://localhost:5000/users", userData);
      alert("User created successfully!");

      // Navigate to admin dashboard after successful creation
      navigate("/AdminDashboard");
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="create-user-container">
      <div className="create-user-header">
        <h1>Create New User</h1>
        <p>Add a new user to the system</p>
      </div>

      {error && <div className="create-user-error">{error}</div>}

      <form className="create-user-form" onSubmit={handleSubmit}>
        <div className="create-user-section">
          <h3 className="create-user-section-title">User Information</h3>

          <div className="create-user-form-group">
            <label className="create-user-label create-user-label-required">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              placeholder="Enter name"
              required
              className="create-user-input"
            />
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label">
              Email {userData.role === "Worker" ? "(Optional)" : "*"}
            </label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder={
                userData.role === "Worker"
                  ? "Enter email (optional for workers)"
                  : "Enter email"
              }
              required={userData.role !== "Worker"}
              className="create-user-input"
            />
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label create-user-label-required">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              minLength="6"
              required
              className="create-user-input"
            />
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label">Phone</label>
            <input
              type="text"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="create-user-input"
            />
          </div>

          <div className="create-user-form-group">
            <label className="create-user-label create-user-label-required">
              Role
            </label>
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="create-user-select"
            >
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Site Supervisor">Site Supervisor</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Financial Manager">Financial Manager</option>
              <option value="Worker">Worker</option>
            </select>
          </div>
        </div>

        <div className="create-user-form-actions">
          <button
            type="submit"
            disabled={loading}
            className="create-user-submit-btn"
          >
            {loading ? "Creating..." : "Create User"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="create-user-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;

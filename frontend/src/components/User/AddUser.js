import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const AddUser = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Worker",
    phone: "",
    address: "",
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
      const response = await axios.post(
        "http://localhost:5000/users",
        userData
      );
      console.log("User created:", response.data);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Error creating user");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="create-project-container">
      <div className="create-project-header">
        <h1 className="create-project-title">Add New User</h1>
        <p className="create-project-subtitle">
          Fill in the details below to create a new user
        </p>
      </div>

      {error && <div className="create-project-error">{error}</div>}

      <form className="create-project-form" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="create-project-section">
          <h3 className="create-project-section-title">Basic Information</h3>
          <div className="create-project-grid">
            <div className="create-project-form-group">
              <label className="create-project-label create-project-label-required">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="create-project-input"
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="create-project-form-group">
              <label className="create-project-label create-project-label-required">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="create-project-input"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          <div className="create-project-form-group">
            <label className="create-project-label create-project-label-required">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="create-project-input"
              placeholder="Enter password"
              minLength="6"
              required
            />
          </div>
          <div className="create-project-form-group">
            <label className="create-project-label create-project-label-required">
              Role
            </label>
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="create-project-select"
              required
            >
              <option value="Worker">Worker</option>
              <option value="Site Supervisor">Site Supervisor</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="create-project-section">
          <h3 className="create-project-section-title">Contact Information</h3>
          <div className="create-project-grid">
            <div className="create-project-form-group">
              <label className="create-project-label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                className="create-project-input"
                placeholder="Enter phone number"
              />
            </div>
            <div className="create-project-form-group">
              <label className="create-project-label">Address</label>
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleChange}
                className="create-project-input"
                placeholder="Enter address"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="create-project-form-actions">
          <button
            type="submit"
            className="create-project-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Add User"}
          </button>
          <button
            type="button"
            className="create-project-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;

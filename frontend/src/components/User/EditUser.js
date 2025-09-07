import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./EditUser.css";


const EditUser = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/${id}`);
        const user = response.data.user || response.data;
        setUserData({
          name: user.name || "",
          email: user.email || "",
          password: "", // Don't pre-fill password for security
          role: user.role || "Worker",
          phone: user.phone || "",
          address: user.address || "",
        });
      } catch (err) {
        setError("Error fetching user data");
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`http://localhost:5000/users/${id}`, userData);
      navigate(`/user/${id}`);
    } catch (err) {
      setError(
        "Error updating user: " + (err.response?.data?.message || err.message)
      );
      console.error("Error updating user:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-user-container">
      <div className="edit-user-header">
        <h1>Edit User</h1>
        <p>Update user information</p>
      </div>
      {error && <div className="edit-user-error">{error}</div>}
      <form className="edit-user-form" onSubmit={handleSubmit}>
        <div className="edit-user-section">
          <h3 className="edit-user-section-title">User Information</h3>
          <div className="edit-user-form-group">
            <label className="edit-user-label edit-user-label-required">Name</label>
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={handleChange}
              required
              className="edit-user-input"
            />
          </div>
          <div className="edit-user-form-group">
            <label className="edit-user-label edit-user-label-required">Email</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
              className="edit-user-input"
            />
          </div>
          <div className="edit-user-form-group">
            <label className="edit-user-label">Password (leave blank to keep current)</label>
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="edit-user-input"
            />
          </div>
          <div className="edit-user-form-group">
            <label className="edit-user-label edit-user-label-required">Role</label>
            <select
              name="role"
              value={userData.role}
              onChange={handleChange}
              className="edit-user-select"
            >
              <option value="Admin">Admin</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Site Supervisor">Site Supervisor</option>
              <option value="Inventory Manager">Inventory Manager</option>
              <option value="Financial Manager">Financial Manager</option>
              <option value="Worker">Worker</option>
            </select>
          </div>
          <div className="edit-user-form-group">
            <label className="edit-user-label">Phone</label>
            <input
              type="text"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              className="edit-user-input"
            />
          </div>
          <div className="edit-user-form-group">
            <label className="edit-user-label">Address</label>
            <textarea
              name="address"
              value={userData.address}
              onChange={handleChange}
              rows="3"
              className="edit-user-textarea"
            />
          </div>
        </div>
        <div className="edit-user-form-actions">
          <button
            type="submit"
            disabled={loading}
            className="edit-user-submit-btn"
          >
            {loading ? "Updating..." : "Update User"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="edit-user-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateClient.css";

const CreateClient = () => {
  const navigate = useNavigate();
  const [clientData, setClientData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/clients",
        clientData
      );
      console.log("Client created:", response.data);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Error creating client");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="create-client-container">
      <div className="create-client-header">
        <h1>Create New Client</h1>
        <p>Fill in the details below to create a new client</p>
      </div>

      {error && <div className="create-client-error">{error}</div>}

      <form className="create-client-form" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="create-client-section">
          <h3 className="create-client-section-title">Basic Information</h3>
          <div className="create-client-grid">
            <div className="create-client-form-group">
              <label className="create-client-label create-client-label-required">
                Client Name
              </label>
              <input
                type="text"
                name="name"
                value={clientData.name}
                onChange={handleChange}
                className="create-client-input"
                placeholder="Enter client name"
                required
              />
            </div>
            <div className="create-client-form-group">
              <label className="create-client-label">Company</label>
              <input
                type="text"
                name="company"
                value={clientData.company}
                onChange={handleChange}
                className="create-client-input"
                placeholder="Enter company name"
              />
            </div>
          </div>
          <div className="create-client-form-group">
            <label className="create-client-label create-client-label-required">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={clientData.email}
              onChange={handleChange}
              className="create-client-input"
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="create-client-form-group">
            <label className="create-client-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={clientData.phone}
              onChange={handleChange}
              className="create-client-input"
              placeholder="Enter phone number"
            />
          </div>
          <div className="create-client-form-group">
            <label className="create-client-label create-client-label-required">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={clientData.password}
              onChange={handleChange}
              className="create-client-input"
              placeholder="Enter password (min 6 characters)"
              required
              minLength="6"
            />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="create-client-section">
          <h3 className="create-client-section-title">
            Additional Information
          </h3>
          <div className="create-client-form-group">
            <label className="create-client-label">Address</label>
            <textarea
              name="address"
              value={clientData.address}
              onChange={handleChange}
              className="create-client-textarea"
              placeholder="Enter client address"
            />
          </div>
          <div className="create-client-form-group">
            <label className="create-client-label">Contact Person</label>
            <input
              type="text"
              name="contactPerson"
              value={clientData.contactPerson}
              onChange={handleChange}
              className="create-client-input"
              placeholder="Enter contact person name"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="create-client-form-actions">
          <button
            type="submit"
            className="create-client-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Client"}
          </button>
          <button
            type="button"
            className="create-client-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;

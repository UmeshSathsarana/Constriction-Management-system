import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Dashboard/project.css";

const ClientProfile = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    contactPerson: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/clients/${authUser._id}`
      );
      if (response.data.client) {
        setProfileData({
          name: response.data.client.name || "",
          email: response.data.client.email || "",
          phone: response.data.client.phone || "",
          company: response.data.client.company || "",
          address: response.data.client.address || "",
          contactPerson: response.data.client.contactPerson || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await axios.put(
        `http://localhost:5000/clients/${authUser._id}`,
        profileData
      );
      setSuccessMsg("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="project-manager-dashboard">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <h1>Update Profile</h1>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "14px",
            marginLeft: "auto",
          }}
        >
          Logout
        </button>
      </div>

      <form className="create-client-form" onSubmit={handleSave}>
        {error && <div className="create-client-error">{error}</div>}
        {successMsg && (
          <div style={{ color: "green", marginBottom: "15px" }}>
            {successMsg}
          </div>
        )}

        <div className="create-client-form-group">
          <label className="create-client-label">Name</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleChange}
            className="create-client-input"
            required
          />
        </div>

        <div className="create-client-form-group">
          <label className="create-client-label">Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            className="create-client-input"
            required
          />
        </div>

        <div className="create-client-form-group">
          <label className="create-client-label">Phone</label>
          <input
            type="tel"
            name="phone"
            value={profileData.phone}
            onChange={handleChange}
            className="create-client-input"
          />
        </div>

        <div className="create-client-form-group">
          <label className="create-client-label">Company</label>
          <input
            type="text"
            name="company"
            value={profileData.company}
            onChange={handleChange}
            className="create-client-input"
          />
        </div>

        <div className="create-client-form-group">
          <label className="create-client-label">Address</label>
          <textarea
            name="address"
            value={profileData.address}
            onChange={handleChange}
            className="create-client-textarea"
          />
        </div>

        <div className="create-client-form-group">
          <label className="create-client-label">Contact Person</label>
          <input
            type="text"
            name="contactPerson"
            value={profileData.contactPerson}
            onChange={handleChange}
            className="create-client-input"
          />
        </div>

        <div className="create-client-form-actions">
          <button
            type="submit"
            className="create-client-submit-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="create-client-cancel-btn"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientProfile;

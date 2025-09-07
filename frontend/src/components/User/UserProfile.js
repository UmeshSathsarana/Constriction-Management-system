import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../Dashboard/dashboard2.css";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/${id}`);
        setUser(response.data.user || response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching user data");
        setLoading(false);
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div style={{ padding: 20 }}>Loading user data...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
  if (!user) return <div style={{ padding: 20 }}>User not found</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>User Profile</h1>
          <p>Detailed information for {user.name}</p>
        </div>
      </div>

      <div className="user-profile-view">
        <div className="user-profile-header">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-profile-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="user-profile-details">
          <div className="profile-detail-item">
            <h4>Role</h4>
            <p>{user.role || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Phone</h4>
            <p>{user.phone || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Address</h4>
            <p>{user.address || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Status</h4>
            <p>{user.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Joined</h4>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Materials</h4>
            <p>{user.materials ? user.materials.length : 0}</p>
          </div>
        </div>
        <div className="user-profile-actions">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="action-btn view"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

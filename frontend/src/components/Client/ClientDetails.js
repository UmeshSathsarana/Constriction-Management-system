// components/Client/ClientDetails.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../Dashboard/dashboard2.css";

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`/clients/${id}`);
        setClient(response.data.client);
        setLoading(false);
      } catch (err) {
        setError("Error fetching client details");
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);



  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Client Profile</h1>
          <p>Detailed information for {client.name}</p>
        </div>
      </div>

      {/* Client Profile View */}
      <div className="user-profile-view">
        <div className="user-profile-header">
          <div className="user-avatar">
            {client.name ? client.name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="user-profile-info">
            <h2>{client.name}</h2>
            <p>{client.email}</p>
          </div>
        </div>
        <div className="user-profile-details">
          <div className="profile-detail-item">
            <h4>Company</h4>
            <p>{client.company || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Phone</h4>
            <p>{client.phone || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Address</h4>
            <p>{client.address || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Contact Person</h4>
            <p>{client.contactPerson || "N/A"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Status</h4>
            <p>{client.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div className="profile-detail-item">
            <h4>Total Projects</h4>
            <p>{client.projects?.length || 0}</p>
          </div>
        </div>
        <div className="user-profile-actions">
          <Link to={`/edit-client/${client._id}`}>
            <button className="action-btn edit">Edit Client</button>
          </Link>
          <button
            className="action-btn view"
            onClick={() => navigate("/admin-dashboard?tab=clients")}
          >
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;

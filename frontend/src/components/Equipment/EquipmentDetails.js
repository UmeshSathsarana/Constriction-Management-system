import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get(`/equipment/${id}`); // Fixed to use relative URL
        setEquipment(response.data.equipment);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching equipment:", err);
        setError("Error fetching equipment details");
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await axios.delete(`/equipment/${id}`); // Fixed to use relative URL
        alert("Equipment deleted successfully");
        navigate("/equipment");
      } catch (err) {
        alert(
          "Error deleting equipment: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: "#28a745",
      "In Use": "#007bff",
      "Under Maintenance": "#ffc107",
      "Out of Service": "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!equipment) return <div>Equipment not found</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h2>Equipment Details</h2>
        <hr />
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>Code:</strong>{" "}
            <span style={{ color: "#007bff" }}>{equipment.code}</span>
          </p>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>Name:</strong> {equipment.name}
          </p>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>Type:</strong> {equipment.type}
          </p>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>Status:</strong>
            <span
              style={{
                color: getStatusColor(equipment.status),
                fontWeight: "bold",
                marginLeft: "10px",
              }}
            >
              {equipment.status}
            </span>
          </p>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            <strong>Created:</strong>{" "}
            {new Date(equipment.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {equipment.currentProject && (
            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              <strong>Current Project:</strong>{" "}
              {equipment.currentProject.name || "N/A"}
            </p>
          )}
        </div>

        <div style={{ marginTop: "30px" }}>
          <Link to={`/edit-equipment/${equipment._id}`}>
            <button
              style={{
                marginRight: "10px",
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Edit Equipment
            </button>
          </Link>
          <button
            onClick={handleDelete}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Delete Equipment
          </button>
          <Link to="/equipment" style={{ marginLeft: "10px" }}>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Back to List
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;

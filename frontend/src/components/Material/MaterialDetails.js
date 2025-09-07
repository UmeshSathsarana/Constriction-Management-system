// components/Material/MaterialDetails.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

const MaterialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await axios.get(`/materials/${id}`);
        setMaterial(response.data.material);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching material:", err);
        setError("Error fetching material details");
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await axios.delete(`/materials/${id}`);
        alert("Material deleted successfully");
        navigate("/materials");
      } catch (err) {
        alert(
          "Error deleting material: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!material) return <div>Material not found</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Material Details</h2>
      <p>
        <strong>Code:</strong> {material.code}
      </p>
      <p>
        <strong>Name:</strong> {material.name}
      </p>
      <p>
        <strong>Type:</strong> {material.type}
      </p>
      <p>
        <strong>Quantity:</strong> {material.quantity} {material.unit}
      </p>
      <p>
        <strong>Unit Price:</strong> Rs. {material.unitPrice}
      </p>
      <p>
        <strong>Total Value:</strong> Rs. {material.totalValue}
      </p>
      <p>
        <strong>Created:</strong>{" "}
        {new Date(material.createdAt).toLocaleDateString()}
      </p>

      <div style={{ marginTop: "20px" }}>
        <Link to={`/edit-material/${material._id}`}>
          <button style={{ marginRight: "10px" }}>Edit Material</button>
        </Link>
        <button
          onClick={handleDelete}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Delete Material
        </button>
        <Link to="/materials" style={{ marginLeft: "10px" }}>
          <button>Back to List</button>
        </Link>
      </div>
    </div>
  );
};

export default MaterialDetails;

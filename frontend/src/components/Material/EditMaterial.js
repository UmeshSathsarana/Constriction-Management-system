// components/Material/EditMaterial.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditMaterial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materialData, setMaterialData] = useState({
    name: "",
    type: "",
    unit: "",
    quantity: "",
    unitPrice: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await axios.get(`/materials/${id}`);
        const material = response.data.material;
        setMaterialData({
          name: material.name,
          type: material.type,
          unit: material.unit,
          quantity: material.quantity,
          unitPrice: material.unitPrice,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching material:", err);
        setError("Error fetching material data");
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleChange = (e) => {
    setMaterialData({ ...materialData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/materials/${id}`, materialData);
      alert("Material updated successfully");
      navigate(`/material/${id}`);
    } catch (err) {
      setError("Error updating material");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Material</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Material Name:</label>
          <input
            type="text"
            name="name"
            value={materialData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Type:</label>
          <select name="type" value={materialData.type} onChange={handleChange}>
            <option value="Cement">Cement</option>
            <option value="Steel">Steel</option>
            <option value="Bricks">Bricks</option>
            <option value="Sand">Sand</option>
            <option value="Wood">Wood</option>
            <option value="Paint">Paint</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Unit:</label>
          <select name="unit" value={materialData.unit} onChange={handleChange}>
            <option value="kg">Kilogram (kg)</option>
            <option value="tons">Tons</option>
            <option value="pieces">Pieces</option>
            <option value="cubic meters">Cubic Meters</option>
            <option value="bags">Bags</option>
            <option value="liters">Liters</option>
          </select>
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={materialData.quantity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        <div>
          <label>Unit Price:</label>
          <input
            type="number"
            name="unitPrice"
            value={materialData.unitPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        <button type="submit">Update Material</button>
        <button type="button" onClick={() => navigate("/materials")}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditMaterial;

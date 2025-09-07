// components/Material/CreateMaterial.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateMaterial.css";
import "../Dashboard/additional-styles.css";

const CreateMaterial = () => {
  const navigate = useNavigate();
  const [materialData, setMaterialData] = useState({
    name: "",
    type: "Cement",
    unit: "kg",
    quantity: "",
    unitPrice: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setMaterialData({ ...materialData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/materials", materialData);
      navigate("/materials");
    } catch (err) {
      setError("Error creating material");
    }
  };

  return (
    <div className="create-material-container">
      <div className="create-material-header">
        <h1 className="create-material-title">Add New Material</h1>
        <p className="create-material-subtitle">
          Add material details to the inventory
        </p>
      </div>

      {error && <div className="create-material-error">{error}</div>}

      <form className="create-material-form" onSubmit={handleSubmit}>
        <div className="create-material-section">
          <h3 className="create-material-section-title">
            Material Information
          </h3>

          <div className="create-material-form-group">
            <label className="create-material-label create-material-label-required">
              Material Name
            </label>
            <input
              type="text"
              name="name"
              value={materialData.name}
              onChange={handleChange}
              placeholder="Material Name"
              required
              className="create-material-input"
            />
          </div>

          <div className="create-material-form-group">
            <label className="create-material-label create-material-label-required">
              Type
            </label>
            <select
              name="type"
              value={materialData.type}
              onChange={handleChange}
              className="create-material-select"
            >
              <option value="Cement">Cement</option>
              <option value="Steel">Steel</option>
              <option value="Bricks">Bricks</option>
              <option value="Sand">Sand</option>
              <option value="Wood">Wood</option>
              <option value="Paint">Paint</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="create-material-form-group">
            <label className="create-material-label create-material-label-required">
              Unit
            </label>
            <select
              name="unit"
              value={materialData.unit}
              onChange={handleChange}
              className="create-material-select"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="tons">Tons</option>
              <option value="pieces">Pieces</option>
              <option value="cubic meters">Cubic Meters</option>
              <option value="bags">Bags</option>
              <option value="liters">Liters</option>
            </select>
          </div>

          <div className="create-material-form-group">
            <label className="create-material-label create-material-label-required">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={materialData.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              min="0"
              required
              className="create-material-input"
            />
          </div>

          <div className="create-material-form-group">
            <label className="create-material-label create-material-label-required">
              Unit Price
            </label>
            <input
              type="number"
              name="unitPrice"
              value={materialData.unitPrice}
              onChange={handleChange}
              placeholder="Unit Price"
              min="0"
              step="0.01"
              required
              className="create-material-input"
            />
          </div>
        </div>

        <div className="create-material-form-actions">
          <button type="submit" className="create-material-submit-btn">
            Create Material
          </button>
          <button
            type="button"
            onClick={() => navigate("/materials")}
            className="create-material-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMaterial;

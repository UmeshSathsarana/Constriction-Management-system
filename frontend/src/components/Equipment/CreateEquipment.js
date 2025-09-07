import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateEquipment.css";
import "../Dashboard/additional-styles.css";

const CreateEquipment = () => {
  const navigate = useNavigate();
  const [equipmentData, setEquipmentData] = useState({
    name: "",
    type: "Heavy Machinery",
    status: "Available",
  });

  const handleChange = (e) => {
    setEquipmentData({ ...equipmentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/equipment", equipmentData);
      navigate("/equipment");
      alert("Equipment created successfully");
    } catch (err) {
      alert("Error creating equipment: " + err.message);
    }
  };

  return (
    <div className="create-equipment-container">
      <div className="create-equipment-header">
        <h1 className="create-equipment-title">Add New Equipment</h1>
        <p className="create-equipment-subtitle">
          Add equipment details to the inventory
        </p>
      </div>

      <form className="create-equipment-form" onSubmit={handleSubmit}>
        <div className="create-equipment-section">
          <h3 className="create-equipment-section-title">
            Equipment Information
          </h3>

          <div className="create-equipment-form-group">
            <label className="create-equipment-label create-equipment-label-required">
              Equipment Name
            </label>
            <input
              type="text"
              name="name"
              value={equipmentData.name}
              onChange={handleChange}
              required
              className="create-equipment-input"
              placeholder="Enter equipment name"
            />
          </div>

          <div className="create-equipment-form-group">
            <label className="create-equipment-label create-equipment-label-required">
              Type
            </label>
            <select
              name="type"
              value={equipmentData.type}
              onChange={handleChange}
              className="create-equipment-select"
            >
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Power Tools">Power Tools</option>
              <option value="Hand Tools">Hand Tools</option>
              <option value="Safety Equipment">Safety Equipment</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="create-equipment-form-group">
            <label className="create-equipment-label">Status</label>
            <select
              name="status"
              value={equipmentData.status}
              onChange={handleChange}
              className="create-equipment-select"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Out of Service">Out of Service</option>
            </select>
          </div>
        </div>

        <div className="create-equipment-form-actions">
          <button type="submit" className="create-equipment-submit-btn">
            Create Equipment
          </button>
          <button
            type="button"
            onClick={() => navigate("/equipment")}
            className="create-equipment-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEquipment;

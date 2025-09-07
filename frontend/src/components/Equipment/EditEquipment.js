import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipmentData, setEquipmentData] = useState({
    name: "",
    type: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get(`/equimpent/${id}`); // Fixed to use relative URL
        const equipment = response.data.equipment;
        setEquipmentData({
          name: equipment.name,
          type: equipment.type,
          status: equipment.status,
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching equipment:", err);
        setError("Error fetching equipment data");
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const handleChange = (e) => {
    setEquipmentData({ ...equipmentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/equimpent/${id}`, equipmentData); // Fixed to use relative URL
      alert("Equipment updated successfully");
      navigate(`/equimpent/${id}`);
    } catch (err) {
      setError("Error updating equipment");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Edit Equipment</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Equipment Name:</label>
          <input
            type="text"
            name="name"
            value={equipmentData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Type:</label>
          <select
            name="type"
            value={equipmentData.type}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="Heavy Machinery">Heavy Machinery</option>
            <option value="Power Tools">Power Tools</option>
            <option value="Hand Tools">Hand Tools</option>
            <option value="Safety Equipment">Safety Equipment</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Status:</label>
          <select
            name="status"
            value={equipmentData.status}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </div>
        <button
          type="submit"
          style={{ marginRight: "10px", padding: "10px 20px" }}
        >
          Update Equipment
        </button>
        <button
          type="button"
          onClick={() => navigate("/equimpent")}
          style={{ padding: "10px 20px" }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditEquipment;

// components/Material/MaterialList.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const MaterialList = ({ onLogout }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get("/materials");
      setMaterials(response.data.materials || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await axios.delete(`/materials/${id}`);
        alert("Material deleted successfully");
        fetchMaterials(); // Refresh the list
      } catch (err) {
        alert("Error deleting material");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Material Management</h1>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <div className="action-buttons">
        <Link to="/create-material" style={{ textDecoration: "none" }}>
          <button className="action-btn">Add New Material</button>
        </Link>
      </div>

      {materials.length === 0 ? (
        <p>No materials found. Add some materials!</p>
      ) : (
        <div className="equipment-table-container">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>Rs. {item.unitPrice}</td>
                  <td>Rs. {item.totalValue}</td>
                  <td>
                    <Link
                      to={`/material/${item._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <button
                        className="action-btn secondary"
                        style={{ padding: "8px 16px", fontSize: "14px" }}
                      >
                        View
                      </button>
                    </Link>
                    <Link
                      to={`/edit-material/${item._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <button
                        className="action-btn secondary"
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          marginLeft: "5px",
                        }}
                      >
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="action-btn"
                      style={{
                        backgroundColor: "#d32f2f",
                        marginLeft: "5px",
                        padding: "8px 16px",
                        fontSize: "14px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaterialList;

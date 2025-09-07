import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const EquipmentList = ({ onLogout }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get("/equipment");
      setEquipment(response.data.equipment);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`/equipment/${id}`);
        fetchEquipment();
      } catch (err) {
        alert("Error deleting equipment");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Equipment Management</h1>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <div className="action-buttons">
        <Link to="/create-equipment" style={{ textDecoration: "none" }}>
          <button className="action-btn">Add New Equipment</button>
        </Link>
      </div>

      {equipment.length === 0 ? (
        <p>No equipment found. Add some equipment!</p>
      ) : (
        <div className="equipment-table-container">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item) => (
                <tr key={item._id}>
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td
                    className={
                      item.status === "Active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {item.status}
                  </td>
                  <td>
                    <Link
                      to={`/edit-equipment/${item._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <button
                        className="action-btn secondary"
                        style={{ padding: "8px 16px", fontSize: "14px" }}
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

export default EquipmentList;

// components/InventoryDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./project.css";

const InventoryDashboard = ({ authUser, onLogout }) => {
  const [materials, setMaterials] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalEquipment: 0,
    lowStockItems: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const [materialsRes, equipmentRes] = await Promise.all([
        axios.get("http://localhost:5000/materials"),
        axios.get("http://localhost:5000/equipment"),
      ]);

      setMaterials(materialsRes.data.materials || []);
      setEquipment(equipmentRes.data.equipment || []);

      // Calculate stats
      const mats = materialsRes.data.materials || [];
      const totalValue = mats.reduce(
        (sum, m) => sum + m.quantity * m.unitPrice,
        0
      );
      const lowStock = mats.filter((m) => m.quantity < 100).length;

      setStats({
        totalMaterials: mats.length,
        totalEquipment: equipmentRes.data.equipment?.length || 0,
        lowStockItems: lowStock,
        totalValue: totalValue,
      });
    } catch (err) {
      console.error("Error fetching inventory data:", err);
    }
  };

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Management Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {authUser?.name}</span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Materials</h3>
          <p>{stats.totalMaterials}</p>
        </div>
        <div className="stat-card">
          <h3>Total Equipment</h3>
          <p>{stats.totalEquipment}</p>
        </div>
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p>{stats.lowStockItems}</p>
        </div>
        <div className="stat-card">
          <h3>Total Value</h3>
          <p>Rs. {stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Materials Section */}
      <div className="management-section">
        <h2>Materials Management</h2>
        <div className="action-buttons">
          <Link to="/create-material" style={{ textDecoration: "none" }}>
            <button className="action-btn">Add New Material</button>
          </Link>
          <Link to="/materials" style={{ textDecoration: "none" }}>
            <button className="action-btn secondary">View All Materials</button>
          </Link>
        </div>

        {/* Low Stock Alert */}
        {materials.filter((m) => m.quantity < 100).length > 0 && (
          <div className="low-stock-alert">
            <strong>⚠️ Low Stock Alert:</strong>
            <ul>
              {materials
                .filter((m) => m.quantity < 100)
                .map((m) => (
                  <li key={m._id}>
                    <strong>{m.name}</strong> - Only{" "}
                    <span>
                      {m.quantity} {m.unit}
                    </span>{" "}
                    left
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Equipment Section */}
      <div className="management-section">
        <h2>Equipment Management</h2>
        <div className="action-buttons">
          <Link to="/create-equipment" style={{ textDecoration: "none" }}>
            <button className="action-btn">Add New Equipment</button>
          </Link>
          <Link to="/equipment" style={{ textDecoration: "none" }}>
            <button className="action-btn secondary">View All Equipment</button>
          </Link>
        </div>

        <div className="equipment-table-container">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.slice(0, 5).map((eq, index) => (
                <tr key={eq._id}>
                  <td>{eq.code}</td>
                  <td>{eq.name}</td>
                  <td>{eq.type}</td>
                  <td
                    className={
                      eq.status === "Active"
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {eq.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;

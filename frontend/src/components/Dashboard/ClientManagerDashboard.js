// components/Dashboard/ClientManagerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./project.css";
import "./admin-dashboard.css";

const ClientManagerDashboard = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
    const interval = setInterval(fetchClientData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchClientData = async () => {
    try {
      const [clientsRes, projectsRes, financialsRes] = await Promise.all([
        axios.get("http://localhost:5000/clients"),
        axios.get("http://localhost:5000/projects"),
        axios.get("http://localhost:5000/financials"),
      ]);

      const clientsData = clientsRes.data.clients || [];
      const projectsData = projectsRes.data.projects || [];
      const financialsData = financialsRes.data.financials || [];

      // Enhanced client data with project and financial info
      const enhancedClients = clientsData.map((client) => {
        const clientProjects = projectsData.filter(
          (p) => p.client?._id === client._id
        );
        const clientRevenue = financialsData
          .filter(
            (f) =>
              f.type === "Income" &&
              clientProjects.some((p) => p._id === f.project)
          )
          .reduce((sum, f) => sum + f.amount, 0);

        const totalProjectValue = clientProjects.reduce(
          (sum, p) => sum + (p.budget || 0),
          0
        );
        const pendingAmount = Math.max(0, totalProjectValue - clientRevenue);

        return {
          ...client,
          projectCount: clientProjects.length,
          activeProjects: clientProjects.filter(
            (p) => p.status === "Active" || p.status === "In Progress"
          ).length,
          totalRevenue: clientRevenue,
          pendingPayment: pendingAmount,
          totalProjectValue,
        };
      });

      const activeClients = enhancedClients.filter((c) => c.activeProjects > 0);
      const totalRevenue = enhancedClients.reduce(
        (sum, c) => sum + c.totalRevenue,
        0
      );
      const pendingPayments = enhancedClients.reduce(
        (sum, c) => sum + c.pendingPayment,
        0
      );

      setClients(enhancedClients);
      setProjects(projectsData);
      setFinancials(financialsData);
      setStats({
        totalClients: clientsData.length,
        activeClients: activeClients.length,
        totalProjects: projectsData.length,
        totalRevenue,
        pendingPayments,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching client data:", err);
      setLoading(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/clients", newClient);
      alert("Client created successfully!");
      setShowClientModal(false);
      setNewClient({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
      });
      fetchClientData();
    } catch (err) {
      alert(
        "Error creating client: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/clients/${editingClient._id}`,
        newClient
      );
      alert("Client updated successfully!");
      setShowClientModal(false);
      setEditingClient(null);
      setNewClient({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        contactPerson: "",
      });
      fetchClientData();
    } catch (err) {
      alert(
        "Error updating client: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      contactPerson: client.contactPerson || "",
    });
    setShowClientModal(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(`http://localhost:5000/clients/${clientId}`);
        alert("Client deleted successfully!");
        fetchClientData();
      } catch (err) {
        alert(
          "Error deleting client: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  if (loading) return <div>Loading client data...</div>;

  return (
    <div className="inventory-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Client Management Dashboard</h1>
          <h3>Welcome, {authUser?.name} | Client Manager</h3>
        </div>
        <div className="header-actions">
          <button
            className="change-password-btn"
            onClick={() => navigate("/change-password")}
          >
            Change Password
          </button>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          onClick={() => setActiveView("overview")}
          className={`nav-tab ${activeView === "overview" ? "active" : ""}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView("clients")}
          className={`nav-tab ${activeView === "clients" ? "active" : ""}`}
        >
          Clients ({stats.totalClients})
        </button>
        <button
          onClick={() => setActiveView("projects")}
          className={`nav-tab ${activeView === "projects" ? "active" : ""}`}
        >
          Client Projects
        </button>
        <button
          onClick={() => setActiveView("financials")}
          className={`nav-tab ${activeView === "financials" ? "active" : ""}`}
        >
          Payments
        </button>
      </div>

      {/* Overview Tab */}
      {activeView === "overview" && (
        <div>
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Clients</h3>
              <p>{stats.totalClients}</p>
              <p className="stat-description">Active: {stats.activeClients}</p>
            </div>
            <div className="stat-card">
              <h3>Total Projects</h3>
              <p>{stats.totalProjects}</p>
              <p className="stat-description">For all clients</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>Rs. {stats.totalRevenue.toLocaleString()}</p>
              <p className="stat-description">From client payments</p>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p className="pending-amount">
                Rs. {stats.pendingPayments.toLocaleString()}
              </p>
              <p className="stat-description">To be collected</p>
            </div>
          </div>

          {/* Top Clients */}
          <div className="management-section">
            <h2>Top Clients by Revenue</h2>
            <div className="card-grid">
              {clients
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 6)
                .map((client) => (
                  <div key={client._id} className="card">
                    <h3>{client.name}</h3>
                    <p>
                      <strong>Company:</strong> {client.company || "N/A"}
                    </p>
                    <p>
                      <strong>Projects:</strong> {client.projectCount} (
                      {client.activeProjects} active)
                    </p>
                    <div className="card financial-info">
                      <div className="financial-row">
                        <span>Revenue:</span>
                        <span className="revenue-amount">
                          Rs. {client.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="financial-row">
                        <span>Pending:</span>
                        <span className="pending-amount">
                          Rs. {client.pendingPayment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeView === "clients" && (
        <div className="management-section">
          <div className="section-header">
            <h2>Client Management</h2>
            <button
              onClick={() => {
                setEditingClient(null);
                setNewClient({
                  name: "",
                  company: "",
                  email: "",
                  phone: "",
                  address: "",
                  contactPerson: "",
                });
                setShowClientModal(true);
              }}
              className="action-btn add-client-btn"
            >
              + Add New Client
            </button>
          </div>

          <div className="equipment-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Projects</th>
                  <th>Revenue</th>
                  <th>Pending</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.company || "-"}</td>
                    <td>{client.email || "-"}</td>
                    <td>{client.phone || "-"}</td>
                    <td>
                      {client.projectCount} ({client.activeProjects} active)
                    </td>
                    <td className="revenue-cell">
                      Rs. {client.totalRevenue.toLocaleString()}
                    </td>
                    <td className="pending-cell">
                      Rs. {client.pendingPayment.toLocaleString()}
                    </td>
                    <td>
                      <div className="button-group">
                        <button
                          onClick={() => navigate(`/client/${client._id}`)}
                          className="action-btn secondary"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="action-btn secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client._id)}
                          className="action-btn delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeView === "projects" && (
        <div className="management-section">
          <h2>Client Projects Overview</h2>
          <div className="card-grid">
            {clients
              .filter((c) => c.projectCount > 0)
              .map((client) => {
                const clientProjects = projects.filter(
                  (p) => p.client?._id === client._id
                );
                return (
                  <div key={client._id} className="card">
                    <div className="card-header">
                      <h3>{client.name}</h3>
                      <p className="client-company">
                        {client.company || "Individual Client"}
                      </p>
                    </div>
                    <div className="card-body">
                      {clientProjects.map((project) => (
                        <div key={project._id} className="project-item">
                          <div className="project-header">
                            <strong>{project.name}</strong>
                            <span
                              className={`status-badge ${
                                project.status === "Active" ||
                                project.status === "In Progress"
                                  ? "active"
                                  : project.status === "Completed"
                                  ? "completed"
                                  : "pending"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                          <p className="project-detail">
                            Budget: Rs.{" "}
                            {project.budget?.toLocaleString() || "N/A"}
                          </p>
                          <p className="project-detail">
                            Progress: {project.progress || 0}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingClient ? "Edit Client" : "Create New Client"}</h2>
            <form
              onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
            >
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) =>
                    setNewClient({ ...newClient, company: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={newClient.contactPerson}
                  onChange={(e) =>
                    setNewClient({
                      ...newClient,
                      contactPerson: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </div>

              <div className="button-group">
                <button type="submit" className="action-btn">
                  {editingClient ? "Update Client" : "Create Client"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientModal(false);
                    setEditingClient(null);
                    setNewClient({
                      name: "",
                      company: "",
                      email: "",
                      phone: "",
                      address: "",
                      contactPerson: "",
                    });
                  }}
                  className="action-btn secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagerDashboard;

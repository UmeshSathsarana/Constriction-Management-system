import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./project.css";

const ClientDashboard = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      // Fetch projects for this client
      const projectsRes = await axios.get("http://localhost:5000/projects");
      const clientProjects =
        projectsRes.data.projects?.filter(
          (project) => project.client?._id === authUser?._id
        ) || [];

      setProjects(clientProjects);

      // Calculate stats
      const totalProjects = clientProjects.length;
      const activeProjects = clientProjects.filter(
        (p) => p.status === "Active"
      ).length;
      const completedProjects = clientProjects.filter(
        (p) => p.status === "Completed"
      ).length;
      const totalBudget = clientProjects.reduce(
        (sum, project) => sum + (project.budget || 0),
        0
      );

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
      });
    } catch (err) {
      console.error("Error fetching client data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-manager-dashboard">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <h1>Welcome, {authUser?.name}</h1>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "14px",
            marginLeft: "auto",
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="project-manager-stats-grid">
        <div className="project-manager-stat-card total">
          <h3>Total Projects</h3>
          <p className="stat-number">{stats.totalProjects}</p>
        </div>
        <div className="project-manager-stat-card active">
          <h3>Active Projects</h3>
          <p className="stat-number">{stats.activeProjects}</p>
        </div>
        <div className="project-manager-stat-card completed">
          <h3>Completed Projects</h3>
          <p className="stat-number">{stats.completedProjects}</p>
        </div>
        <div className="project-manager-stat-card pending">
          <h3>Total Budget</h3>
          <p className="stat-number">${stats.totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="project-manager-actions">
        <button
          className="project-manager-action-btn secondary"
          onClick={() => navigate("/client/projects")}
        >
          <span className="btn-icon">📋</span>
          <span className="btn-text">View My Projects</span>
        </button>
        <button
          className="project-manager-action-btn secondary"
          onClick={() => navigate("/client/progress")}
        >
          <span className="btn-icon">📊</span>
          <span className="btn-text">View Progress Reports</span>
        </button>
        <button
          className="project-manager-action-btn secondary"
          onClick={() => navigate("/client/reports")}
        >
          <span className="btn-icon">📄</span>
          <span className="btn-text">Download Reports</span>
        </button>
      </div>

      {/* Recent Projects */}
      <div className="project-manager-section">
        <h2>My Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              color: "#6c757d",
            }}
          >
            <h3>No projects assigned yet</h3>
            <p>Your projects will appear here once they are assigned to you.</p>
          </div>
        ) : (
          <div className="activities-grid">
            {projects.slice(0, 6).map((project) => (
              <div key={project._id} className="activity-card">
                <div className="project-header-inline">
                  <h3>{project.name}</h3>
                  <span
                    className={`status-badge ${
                      project.status?.toLowerCase().replace(" ", "-") ||
                      "unknown"
                    }`}
                  >
                    {project.status || "Unknown Status"}
                  </span>
                </div>

                <div className="project-content-inline">
                  <p>
                    <strong>Location:</strong> {project.location || "N/A"}
                  </p>
                  <p>
                    <strong>Budget:</strong> $
                    {project.budget?.toLocaleString() || "N/A"}
                  </p>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                {project.description && (
                  <div
                    className="work-description"
                    style={{
                      marginTop: 10,
                      padding: 10,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 4,
                    }}
                  >
                    <p style={{ fontSize: 14, margin: 0, color: "#333" }}>
                      <strong>Description:</strong> {project.description}
                    </p>
                  </div>
                )}

                <p className="meta">
                  <strong>Project ID:</strong> {project._id.slice(-8)} •{" "}
                  <strong>Created:</strong>{" "}
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>

                <div className="activity-actions">
                  <button
                    className="view-details-btn"
                    onClick={() => navigate(`/client/project/${project._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="project-manager-section">
        <h2>Quick Actions</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#004080", marginBottom: "10px" }}>
              Contact Support
            </h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Need help with your projects? Contact our support team.
            </p>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/client/support")}
            >
              Get Support
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#004080", marginBottom: "10px" }}>
              Download Reports
            </h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Access and download your project reports and documents.
            </p>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/client/reports")}
            >
              View Reports
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#004080", marginBottom: "10px" }}>
              Update Profile
            </h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              Keep your contact information and preferences up to date.
            </p>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#17a2b8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/client/profile")}
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

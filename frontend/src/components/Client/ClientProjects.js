import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Dashboard/project.css";

const ClientProjects = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchClientProjects();
  }, []);

  const fetchClientProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/projects");
      const clientProjects =
        response.data.projects?.filter(
          (project) => project.client?._id === authUser?._id
        ) || [];
      setProjects(clientProjects);
    } catch (err) {
      console.error("Error fetching client projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    if (filter === "all") return true;
    return project.status?.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="project-manager-dashboard">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading your projects...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <h1>My Projects</h1>
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

      {/* Filter Buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setFilter("all")}
          className={`project-manager-action-btn ${
            filter === "all" ? "primary" : "secondary"
          }`}
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          All Projects ({projects.length})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`project-manager-action-btn ${
            filter === "active" ? "primary" : "secondary"
          }`}
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          Active ({projects.filter((p) => p.status === "Active").length})
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`project-manager-action-btn ${
            filter === "completed" ? "primary" : "secondary"
          }`}
          style={{ padding: "8px 16px", fontSize: "14px" }}
        >
          Completed ({projects.filter((p) => p.status === "Completed").length})
        </button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            color: "#6c757d",
          }}
        >
          <h3>No projects found</h3>
          <p>
            {filter === "all"
              ? "You don't have any projects assigned yet."
              : `No ${filter} projects found.`}
          </p>
        </div>
      ) : (
        <div className="activities-grid">
          {filteredProjects.map((project) => (
            <div key={project._id} className="activity-card">
              <div className="project-header-inline">
                <h3>{project.name}</h3>
                <span
                  className={`status-badge ${
                    project.status?.toLowerCase().replace(" ", "-") || "unknown"
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
                <p>
                  <strong>End Date:</strong>{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
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
                <button
                  className="view-details-btn"
                  onClick={() =>
                    navigate(`/client/project/${project._id}/progress`)
                  }
                  style={{ marginLeft: "10px" }}
                >
                  View Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back to Dashboard */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="project-manager-action-btn secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ClientProjects;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Dashboard/project.css";

const ClientProgressReports = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [progressReports, setProgressReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressReports();
  }, []);

  const fetchProgressReports = async () => {
    try {
      setLoading(true);
      // Fetch progress reports related to client's projects
      const response = await axios.get("http://localhost:5000/progress");
      // Filter reports for projects belonging to this client
      const clientReports =
        response.data.progress?.filter(
          (report) => report.project?.client?._id === authUser?._id
        ) || [];
      setProgressReports(clientReports);
    } catch (err) {
      console.error("Error fetching progress reports:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="project-manager-dashboard">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading progress reports...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <h1>Progress Reports</h1>
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

      {progressReports.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            color: "#6c757d",
          }}
        >
          <h3>No progress reports found</h3>
          <p>You have no progress reports for your projects yet.</p>
        </div>
      ) : (
        <div className="activities-grid">
          {progressReports.map((report) => (
            <div key={report._id} className="activity-card">
              <div className="project-header-inline">
                <h3>{report.project?.name || "Project Name"}</h3>
                <span
                  className={`status-badge ${
                    report.project?.status?.toLowerCase() || "unknown"
                  }`}
                >
                  {report.project?.status || "Unknown Status"}
                </span>
              </div>

              <div className="project-content-inline">
                <p>
                  <strong>Progress:</strong> {report.percentageComplete}%
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(report.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Reported by:</strong>{" "}
                  {report.reportedBy?.name || "Unknown"}
                </p>
              </div>

              {report.workDescription && (
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
                    <strong>Work Done:</strong> {report.workDescription}
                  </p>
                </div>
              )}

              <div className="activity-actions">
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/progress/${report._id}`)}
                >
                  View Full Report
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

export default ClientProgressReports;

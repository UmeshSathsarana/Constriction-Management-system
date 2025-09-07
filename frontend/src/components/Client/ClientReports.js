import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Dashboard/project.css";

const ClientReports = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    fetchClientReports();
  }, []);

  const fetchClientReports = async () => {
    try {
      setLoading(true);
      // Fetch progress reports for client's projects
      const response = await axios.get("http://localhost:5000/progress");
      const clientReports =
        response.data.progress?.filter(
          (report) => report.project?.client?._id === authUser?._id
        ) || [];
      setReports(clientReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId, reportName) => {
    try {
      setDownloading(reportId);
      // In a real application, this would call an API endpoint to generate and download the report
      // For now, we'll simulate the download by creating a simple text file
      const report = reports.find((r) => r._id === reportId);
      if (report) {
        const reportContent = `
Project Progress Report
======================

Project: ${report.project?.name || "N/A"}
Date: ${new Date(report.date).toLocaleDateString()}
Progress: ${report.percentageComplete}%
Reported by: ${report.reportedBy?.name || "N/A"}

Work Description:
${report.workDescription || "No description provided"}

Generated on: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([reportContent], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportName}_report.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="project-manager-dashboard">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>Loading reports...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <h1>Download Reports</h1>
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

      {reports.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            color: "#6c757d",
          }}
        >
          <h3>No reports available</h3>
          <p>You have no progress reports to download yet.</p>
        </div>
      ) : (
        <div className="activities-grid">
          {reports.map((report) => (
            <div key={report._id} className="activity-card">
              <div className="project-header-inline">
                <h3>{report.project?.name || "Project Name"}</h3>
                <span className="status-badge active">Progress Report</span>
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
                  style={{ marginRight: "10px" }}
                >
                  View Full Report
                </button>
                <button
                  className="view-details-btn"
                  onClick={() =>
                    handleDownloadReport(
                      report._id,
                      report.project?.name || "Project"
                    )
                  }
                  disabled={downloading === report._id}
                  style={{
                    backgroundColor:
                      downloading === report._id ? "#6c757d" : "#28a745",
                    color: "white",
                  }}
                >
                  {downloading === report._id
                    ? "Downloading..."
                    : "Download Report"}
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

export default ClientReports;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard/dashboard2.css";

const ProgressReportDetails = ({ authUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/progress/${id}`);
      setReport(response.data.progress);
    } catch (err) {
      console.error("Error fetching report details:", err);
      setError("Failed to load report details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "pending";
    return status.toLowerCase();
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return "#28a745"; // Green for high progress
    if (percentage >= 50) return "#ffc107"; // Yellow for medium progress
    return "#dc3545"; // Red for low progress
  };

  const getDashboardPath = () => {
    switch (authUser?.role) {
      case "Admin":
        return "/admin-dashboard";
      case "Project Manager":
        return "/pm/dashboard";
      case "Site Supervisor":
        return "/supervisor/dashboard";
      case "Inventory Manager":
        return "/inventory/dashboard";
      case "Client":
        return "/dashboard";
      default:
        return "/dashboard";
    }
  };

  if (loading) {
    return (
      <div className="progress-report-details">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-report-details">
        <div className="error-container">
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <button
            className="back-btn"
            onClick={() => navigate(getDashboardPath())}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="progress-report-details">
        <div className="error-container">
          <h2>Report Not Found</h2>
          <p>The requested progress report could not be found.</p>
          <button
            className="back-btn"
            onClick={() => navigate(getDashboardPath())}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-report-details">
      {/* Header */}
      <div className="report-header">
        <button
          className="back-btn"
          onClick={() => navigate(getDashboardPath())}
        >
          ← Back to Dashboard
        </button>
        <h1>Progress Report Details</h1>
        <div className="report-status">
          <span
            className={`status-badge ${getStatusBadgeClass(report.status)}`}
          >
            {report.status || "Submitted"}
          </span>
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {/* Project Information */}
        <div className="report-section">
          <h2>Project Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Project Name:</label>
              <span>
                {report.project?.name || "Project name not available"}
              </span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>
                {report.project?.location || "Location not specified"}
              </span>
            </div>
            <div className="info-item">
              <label>Client:</label>
              <span>
                {report.project?.client?.name ||
                  "Client information not available"}
              </span>
            </div>
            <div className="info-item">
              <label>Project Manager:</label>
              <span>
                {report.project?.projectManager?.name ||
                  "Project manager not assigned"}
              </span>
            </div>
            <div className="info-item">
              <label>Project Type:</label>
              <span>{report.project?.type || "Type not specified"}</span>
            </div>
            <div className="info-item">
              <label>Project Budget:</label>
              <span>
                {report.project?.budget
                  ? `$${report.project.budget.toLocaleString()}`
                  : "Budget not specified"}
              </span>
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="report-section">
          <h2>Report Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Report Date:</label>
              <span>{formatDate(report.date)}</span>
            </div>
            <div className="info-item">
              <label>Reported By:</label>
              <span>
                {report.reportedBy?.name ||
                  "Reporter information not available"}
              </span>
            </div>
            <div className="info-item">
              <label>Reporter Role:</label>
              <span>{report.reportedBy?.role || "Role not specified"}</span>
            </div>
            <div className="info-item">
              <label>Progress Percentage:</label>
              <span>{report.percentageComplete || 0}%</span>
            </div>
            <div className="info-item">
              <label>Report ID:</label>
              <span>{report._id || "ID not available"}</span>
            </div>
            <div className="info-item">
              <label>Last Updated:</label>
              <span>{formatDate(report.updatedAt)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <label>Progress Visualization:</label>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${report.percentageComplete || 0}%`,
                  background: getProgressColor(report.percentageComplete || 0),
                }}
              ></div>
            </div>
            <span className="progress-text">
              {report.percentageComplete || 0}% Complete
            </span>
          </div>
        </div>

        {/* Work Completed */}
        <div className="report-section">
          <h2>Work Completed</h2>
          <div className="work-description">
            <p>{report.workDescription || "No work description provided"}</p>
          </div>
        </div>

        {/* Materials Used */}
        {report.materialsUsed && report.materialsUsed.length > 0 && (
          <div className="report-section">
            <h2>Materials Used</h2>
            <div className="info-grid">
              {report.materialsUsed.map((material, index) => (
                <div key={index} className="info-item">
                  <label>{material.name || "Material"}:</label>
                  <span>
                    {material.quantity || "N/A"} {material.unit || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues/Challenges */}
        {report.issues && report.issues.length > 0 && (
          <div className="report-section">
            <h2>Issues/Challenges</h2>
            <div className="work-description">
              <ul>
                {report.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {report.nextSteps && (
          <div className="report-section">
            <h2>Next Steps</h2>
            <div className="work-description">
              <p>{report.nextSteps}</p>
            </div>
          </div>
        )}

        {/* Site Images */}
        {report.images && report.images.length > 0 ? (
          <div className="report-section">
            <h2>Site Images ({report.images.length})</h2>
            <div className="images-grid">
              {report.images.map((image, index) => (
                <div key={index} className="image-item">
                  <img
                    src={image}
                    alt={`Site progress ${index + 1}`}
                    onClick={() => window.open(image, "_blank")}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="image-caption">
                    Image {index + 1} - {formatDate(report.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="report-section">
            <h2>Site Images</h2>
            <div className="work-description">
              <p>No images were uploaded for this progress report.</p>
            </div>
          </div>
        )}

        {/* Weather Conditions */}
        {report.weatherConditions && (
          <div className="report-section">
            <h2>Weather Conditions</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Weather:</label>
                <span>
                  {report.weatherConditions.weather || "Not recorded"}
                </span>
              </div>
              <div className="info-item">
                <label>Temperature:</label>
                <span>
                  {report.weatherConditions.temperature
                    ? `${report.weatherConditions.temperature}°C`
                    : "Not recorded"}
                </span>
              </div>
              <div className="info-item">
                <label>Impact on Work:</label>
                <span>
                  {report.weatherConditions.impact || "No impact recorded"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Safety Incidents */}
        {report.safetyIncidents && report.safetyIncidents.length > 0 && (
          <div className="report-section">
            <h2>Safety Incidents</h2>
            <div className="work-description">
              <ul>
                {report.safetyIncidents.map((incident, index) => (
                  <li key={index}>
                    <strong>{incident.type || "Incident"}:</strong>{" "}
                    {incident.description || "No description"}
                    {incident.actionTaken && (
                      <p>
                        <em>Action Taken: {incident.actionTaken}</em>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="report-actions">
          <button
            className="action-btn secondary"
            onClick={() => navigate(getDashboardPath())}
          >
            Back to Dashboard
          </button>
          {(authUser?.role === "Admin" ||
            authUser?.role === "Project Manager") && (
            <button
              className="action-btn primary"
              onClick={() => navigate(`/project/${report.project?._id}`)}
            >
              View Project Details
            </button>
          )}
          {authUser?.role === "Admin" && (
            <button
              className="action-btn primary"
              onClick={() => navigate(`/edit-progress-report/${report._id}`)}
            >
              Edit Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressReportDetails;

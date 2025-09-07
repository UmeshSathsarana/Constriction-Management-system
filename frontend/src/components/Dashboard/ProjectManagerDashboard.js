// components/ProjectManagerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./project.css";

const ProjectManagerDashboard = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [recentProgress, setRecentProgress] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    activeProjects: 0,
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [completeReport, setCompleteReport] = useState({
    project: "",
    reportType: "Progress",
    title: "",
    summary: "",
    recommendations: "",
    status: "Completed",
    sendToAdmin: true,
  });
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    reportType: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, projectsRes, progressRes, reportsRes] =
        await Promise.all([
          axios.get("http://localhost:5000/tasks"),
          axios.get("http://localhost:5000/projects"),
          axios.get("http://localhost:5000/progress/latest"),
          axios.get("http://localhost:5000/reports"),
        ]);

      setTasks(tasksRes.data.tasks || []);
      setProjects(projectsRes.data.projects || []);
      setRecentProgress(progressRes.data.latestProgress || []);
      setReports(reportsRes.data.reports || []);

      // Calculate stats
      const taskStats = tasksRes.data.tasks || [];
      setStats({
        totalTasks: taskStats.length,
        completedTasks: taskStats.filter((t) => t.status === "Completed")
          .length,
        pendingTasks: taskStats.filter((t) => t.status === "Pending").length,
        activeProjects:
          projectsRes.data.projects?.filter((p) => p.status === "Active")
            .length || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/tasks/${taskId}/status`, {
        status: newStatus,
      });
      fetchDashboardData();
      alert("Task status updated successfully");
    } catch (err) {
      alert("Error updating task status");
    }
  };

  // Delete task function
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`);
      fetchDashboardData(); // Refresh data after deletion
      alert("Task deleted successfully!");
    } catch (err) {
      alert("Error deleting task");
    }
  };

  const startEditReport = (report) => {
    setEditingReport(report._id);
    setEditForm({
      title: report.title,
      description: report.description,
      reportType: report.reportType,
    });
  };

  const cancelEditReport = () => {
    setEditingReport(null);
    setEditForm({
      title: "",
      description: "",
      reportType: "",
    });
  };

  const saveEditReport = async (reportId) => {
    try {
      await axios.put(`http://localhost:5000/reports/${reportId}`, editForm);
      alert("Report updated successfully");
      setEditingReport(null);
      fetchDashboardData();
    } catch (err) {
      alert("Error updating report");
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`http://localhost:5000/reports/${reportId}`);
        alert("Report deleted successfully");
        fetchDashboardData();
      } catch (err) {
        alert("Error deleting report");
      }
    }
  };

  // Handle complete report submission
  const handleSubmitCompleteReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Submit complete report to backend
      const reportData = {
        project: completeReport.project,
        reportType: completeReport.reportType,
        title:
          completeReport.title ||
          `Complete Report - ${
            projects.find((p) => p._id === completeReport.project)?.name ||
            "Project"
          }`,
        description: completeReport.summary,
        reportDate: new Date(),
        submittedBy: authUser?._id,
        data: {
          recommendations: completeReport.recommendations,
        },
      };

      await axios.post("http://localhost:5000/reports", reportData);

      // Update project status if needed
      if (completeReport.project) {
        await axios.patch(
          `http://localhost:5000/projects/${completeReport.project}/status`,
          {
            status: completeReport.status,
          }
        );
      }

      alert("Complete report submitted successfully!");
      setCompleteReport({
        project: "",
        summary: "",
        recommendations: "",
        status: "Completed",
        sendToAdmin: true,
      });
      fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error("Error submitting complete report:", err);
      alert(
        "Error submitting complete report: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <h1>Welcome, Project Manager {authUser?.name}</h1>
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
            marginLeft: "auto"
          }}
        >
          Logout
        </button>
      </div>

      {/* Stats Section */}
      <div className="project-manager-stats-grid">
        <div className="project-manager-stat-card total">
          <h3>Total Tasks</h3>
          <p className="stat-number">{stats.totalTasks}</p>
        </div>
        <div className="project-manager-stat-card completed">
          <h3>Completed</h3>
          <p className="stat-number">{stats.completedTasks}</p>
        </div>
        <div className="project-manager-stat-card pending">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pendingTasks}</p>
        </div>
        <div className="project-manager-stat-card active">
          <h3>Active Projects</h3>
          <p className="stat-number">{stats.activeProjects}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="project-manager-actions">
        <Link to="/create-task">
          <button className="project-manager-action-btn add-task">
            <span className="btn-icon">+</span>
            <span className="btn-text">Create New Task</span>
          </button>
        </Link>
        <Link to="/tasks">
          <button className="project-manager-action-btn secondary">
            <span className="btn-icon">📋</span>
            <span className="btn-text">View All Tasks</span>
          </button>
        </Link>
        <Link to="/projects">
          <button className="project-manager-action-btn secondary">
            <span className="btn-icon">🏗️</span>
            <span className="btn-text">View Projects</span>
          </button>
        </Link>
      </div>

      {/* Site Supervisor Progress Reports */}
      <div className="project-manager-section">
        <h2>Site Supervisor Progress Reports</h2>
        <div className="activities-grid">
          {recentProgress.slice(0, 6).map((report) => (
            <div key={report._id} className="activity-card">
              <div className="project-header-inline">
                <h3>{report.project?.name || "Project Name Not Available"}</h3>
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
                  <strong>Client:</strong>{" "}
                  {report.project?.client?.name || "N/A"}
                </p>
                <p>
                  <strong>Location:</strong> {report.project?.location || "N/A"}
                </p>
                <p>
                  <strong>Progress:</strong> {report.percentageComplete}%
                </p>
              </div>

              <div className="progress-label-inline">
                <span>Progress</span>
                <span>{report.percentageComplete}%</span>
              </div>
              <div className="progress-bar-inline">
                <div
                  className="progress-fill-inline"
                  style={{ width: `${report.percentageComplete}%` }}
                />
              </div>

              {report.images && report.images.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 12, color: "#666" }}>
                    📸 {report.images.length} site images uploaded
                  </p>
                </div>
              )}

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
                  <strong>Work Done:</strong>{" "}
                  {report.workDescription || "No description provided"}
                </p>
              </div>

              <p className="meta">
                <strong>Reported by:</strong>{" "}
                {report.reportedBy?.name || "Unknown"} • <strong>Date:</strong>{" "}
                {new Date(report.date).toLocaleDateString()} •{" "}
                <strong>Time:</strong>{" "}
                {new Date(report.date).toLocaleTimeString()}
              </p>

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
      </div>

      {/* Recent Tasks */}
      <div className="project-manager-section">
        <h2>Recent Tasks</h2>
        <div className="project-manager-table-container">
          <table className="project-manager-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.slice(0, 5).map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.project?.name}</td>
                  <td>
                    <span
                      className={`status-badge ${task.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`priority-badge ${task.priority
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/task/${task._id}`}>
                        <button className="view-btn">View</button>
                      </Link>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTaskStatus(task._id, e.target.value)
                        }
                        className="status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="delete-btn"
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

      {/* Reports Section */}
      <div className="project-manager-section">
        <h2>Reports ({reports.length})</h2>
        <div className="activities-grid">
          {reports.slice(0, 6).map((report) => (
            <div key={report._id} className="activity-card">
              {editingReport === report._id ? (
                <div>
                  <h3>Edit Report: {report.title || "Report Title"}</h3>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                      Title:
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                      Description:
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc", minHeight: 80 }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                      Report Type:
                    </label>
                    <select
                      value={editForm.reportType}
                      onChange={(e) => setEditForm({ ...editForm, reportType: e.target.value })}
                      style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                    >
                      <option value="Progress">Progress</option>
                      <option value="Complete">Complete</option>
                      <option value="Issue">Issue</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => saveEditReport(report._id)}
                      style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditReport}
                      style={{ padding: "8px 16px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="project-header-inline">
                    <h3>{report.title || "Report Title"}</h3>
                    <span
                      className={`status-badge ${
                        report.reportType?.toLowerCase() || "unknown"
                      }`}
                    >
                      {report.reportType || "Report"}
                    </span>
                  </div>

                  <div className="project-content-inline">
                    <p>
                      <strong>Project:</strong> {report.project?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Type:</strong> {report.reportType || "N/A"}
                    </p>
                    <p>
                      <strong>Generated:</strong>{" "}
                      {new Date(report.reportDate).toLocaleDateString()}
                    </p>
                  </div>

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
                      <strong>Description:</strong>{" "}
                      {report.description || "No description provided"}
                    </p>
                  </div>

                  <p className="meta">
                    <strong>Submitted by:</strong>{" "}
                    {report.submittedBy?.name || "Unknown"} • <strong>Date:</strong>{" "}
                    {new Date(report.reportDate).toLocaleDateString()}
                  </p>

                  <div className="activity-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/report/${report._id}`)}
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => startEditReport(report)}
                      style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer", marginLeft: 10 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReport(report._id)}
                      style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: 4, cursor: "pointer", marginLeft: 10 }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Complete Report Section */}
      <div className="project-manager-section">
        <h2>Create Complete Report</h2>
        <div
          style={{ backgroundColor: "#f8f9fa", padding: 20, borderRadius: 8 }}
        >
          <form onSubmit={handleSubmitCompleteReport}>
            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                Select Project *
              </label>
              <select
                value={completeReport.project}
                onChange={(e) =>
                  setCompleteReport({
                    ...completeReport,
                    project: e.target.value,
                  })
                }
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} - {p.location}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                Project Summary *
              </label>
              <textarea
                value={completeReport.summary}
                onChange={(e) =>
                  setCompleteReport({
                    ...completeReport,
                    summary: e.target.value,
                  })
                }
                required
                style={{
                  width: "100%",
                  padding: 8,
                  minHeight: 100,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                placeholder="Provide a comprehensive summary of the project..."
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                Recommendations
              </label>
              <textarea
                value={completeReport.recommendations}
                onChange={(e) =>
                  setCompleteReport({
                    ...completeReport,
                    recommendations: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: 8,
                  minHeight: 80,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
                placeholder="Any recommendations for future projects or improvements..."
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontWeight: "bold",
                }}
              >
                Final Status *
              </label>
              <select
                value={completeReport.status}
                onChange={(e) =>
                  setCompleteReport({
                    ...completeReport,
                    status: e.target.value,
                  })
                }
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                }}
              >
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={completeReport.sendToAdmin}
                  onChange={(e) =>
                    setCompleteReport({
                      ...completeReport,
                      sendToAdmin: e.target.checked,
                    })
                  }
                  style={{ marginRight: 8 }}
                />
                Send Report to Admin
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 30px",
                backgroundColor: loading ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting..." : "Submit Complete Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;

// components/Dashboard/SiteSupervisorDashboard.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./site.css";
import "./project.css";
import "../Task/SupervisorTaskManagement.css";

const SiteSupervisorDashboard = ({ authUser, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [newReport, setNewReport] = useState({
    project: "",
    workCompleted: "",
    percentageComplete: 0,
    images: [],
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard");
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [editForm, setEditForm] = useState({
    workCompleted: "",
    percentageComplete: 0,
  });

  useEffect(() => {
    fetchData();
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authUser]);

  const fetchData = async () => {
    try {
      const [progressRes, projectsRes, tasksRes] = await Promise.all([
        axios.get("http://localhost:5000/progress/latest"),
        axios.get("http://localhost:5000/projects"),
        axios.get(`/tasks/supervisor/${authUser._id}`),
      ]);

      setProgressReports(progressRes.data.latestProgress || []);
      setProjects(projectsRes.data.projects || []);
      setAssignedTasks(tasksRes.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((images) => {
      setUploadedImages([...uploadedImages, ...images]);
      setNewReport({ ...newReport, images: [...newReport.images, ...images] });
    });
  };

  const removeImage = (index) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    setImageFiles(updatedFiles);
    setNewReport({ ...newReport, images: updatedImages });
  };

  const submitProgressReport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reportData = {
        ...newReport,
        reportedBy: authUser._id || authUser.id,
      };

      await axios.post("http://localhost:5000/progress", reportData);

      // Update project status
      const project = projects.find((p) => p._id === newReport.project);
      if (project && project.status === "Planning") {
        await axios.patch(
          `http://localhost:5000/projects/${newReport.project}/status`,
          {
            status: "In Progress",
          }
        );
      }

      alert("Progress report with images submitted successfully!");
      fetchData(); // Refresh data immediately

      // Reset form
      setNewReport({
        project: "",
        workCompleted: "",
        percentageComplete: 0,
        images: [],
        date: new Date().toISOString().split("T")[0],
      });
      setUploadedImages([]);
      setImageFiles([]);
    } catch (err) {
      alert("Error submitting progress report");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/tasks/${taskId}/status`, {
        status: newStatus,
      });
      fetchData(); // Refresh immediately after update
      alert("Task status updated successfully");
    } catch (err) {
      alert("Error updating task status");
    }
  };

  const startEditReport = (report) => {
    setEditingReport(report._id);
    setEditForm({
      workCompleted: report.workCompleted,
      percentageComplete: report.percentageComplete,
    });
  };

  const cancelEditReport = () => {
    setEditingReport(null);
    setEditForm({
      workCompleted: "",
      percentageComplete: 0,
    });
  };

  const saveEditReport = async (reportId) => {
    try {
      await axios.put(`http://localhost:5000/progress/${reportId}`, editForm);
      alert("Report updated successfully");
      setEditingReport(null);
      fetchData();
    } catch (err) {
      alert("Error updating report");
    }
  };

  const deleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`http://localhost:5000/progress/${reportId}`);
        alert("Report deleted successfully");
        fetchData();
      } catch (err) {
        alert("Error deleting report");
      }
    }
  };

  const pendingTasks = assignedTasks.filter((t) => t.status === "Pending");
  const inProgressTasks = assignedTasks.filter(
    (t) => t.status === "In Progress"
  );
  const completedTasks = assignedTasks.filter((t) => t.status === "Completed");



  // Placeholder functions for worker assignment controls
  const removeWorkerFromTask = (taskId) => {
    // This function should be implemented or imported from SupervisorTaskManagement component
    alert("Remove worker functionality is not implemented in this dashboard.");
  };

  const assignWorkerToTask = (taskId, workerId) => {
    // This function should be implemented or imported from SupervisorTaskManagement component
    alert("Assign worker functionality is not implemented in this dashboard.");
  };

  const availableWorkers = []; // Placeholder, should be fetched or passed as props

  return (
    <div className="project-manager-dashboard">
      <div className="project-manager-header">
        <div>
          <h1>Site Supervisor Dashboard</h1>
          <h3>Welcome, {authUser?.name}</h3>
        </div>
        <div className="nav-tabs">
          <button
            onClick={() => setViewMode("dashboard")}
            className={`nav-tab ${viewMode === "dashboard" ? "active" : ""}`}
          >
            Dashboard
          </button>
          <Link to="/supervisor/tasks" style={{ textDecoration: "none" }}>
            <button className="nav-tab">Task Management</button>
          </Link>

          {/* Task Management View */}
          {viewMode === "tasks" && (
            <div className="site-supervisor-task-management">
              {/* This section uses the same CSS design as the Submit Report form */}
              {/* You can import and use SupervisorTaskManagement component here if available */}
              <p>
                Task Management page content with Submit Report CSS design
                applied.
              </p>
            </div>
          )}
          <button
            onClick={() => setViewMode("progress")}
            className={`nav-tab ${viewMode === "progress" ? "active" : ""}`}
          >
            Submit Progress
          </button>
          <button
            onClick={() => setViewMode("reports")}
            className={`nav-tab ${viewMode === "reports" ? "active" : ""}`}
          >
            View Reports
          </button>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {viewMode === "dashboard" && (
        <div>
          <div className="project-manager-stats-grid">
            <div className="project-manager-stat-card total">
              <h3>Total Tasks</h3>
              <p className="stat-number">{assignedTasks.length}</p>
            </div>
            <div className="project-manager-stat-card pending">
              <h3>Pending</h3>
              <p className="stat-number" style={{ color: "#ff9800" }}>
                {pendingTasks.length}
              </p>
            </div>
            <div className="project-manager-stat-card in-progress">
              <h3>In Progress</h3>
              <p className="stat-number" style={{ color: "#2196f3" }}>
                {inProgressTasks.length}
              </p>
            </div>
            <div className="project-manager-stat-card completed">
              <h3>Completed</h3>
              <p className="stat-number" style={{ color: "#4caf50" }}>
                {completedTasks.length}
              </p>
            </div>
          </div>

          {/* Assigned Tasks */}
          <div className="site-supervisor-section">
            <h3>My Assigned Tasks</h3>
            {assignedTasks.length === 0 ? (
              <p>No tasks assigned to you.</p>
            ) : (
              <div className="site-supervisor-tasks-grid">
                  {assignedTasks.map((task) => (
                    <div key={task._id} className="site-supervisor-task-card">
                      <div className="site-supervisor-task-header">
                        <div>
                          <h4>{task.title}</h4>
                          <p className="site-supervisor-task-meta">
                            <strong>Project:</strong>{" "}
                            {task.project?.name || "N/A"}
                          </p>
                          <p className="site-supervisor-task-meta">
                            <strong>Due Date:</strong>{" "}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="site-supervisor-task-badges">
                          <div className={`site-supervisor-status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                            {task.status}
                          </div>
                          <div className={`site-supervisor-priority-badge ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </div>
                        </div>
                      </div>

                      <div className="site-supervisor-task-content">
                        <p>
                          <strong>Assigned Worker:</strong>{" "}
                          {task.assignedTo?.name || "Unassigned"}
                        </p>
                        {task.description && (
                          <p className="site-supervisor-task-description">
                            <strong>Description:</strong> {task.description}
                          </p>
                        )}
                      </div>

                      {/* Worker Assignment Controls */}
                      <div className="site-supervisor-task-controls">
                        {task.assignedTo ? (
                          <div>
                            <p className="site-supervisor-assigned-message">
                              ✓ Assigned to: {task.assignedTo.name}
                              <span className="site-supervisor-working-badge">
                                Working
                              </span>
                            </p>
                            <button
                              className="site-supervisor-remove-btn"
                              onClick={() => removeWorkerFromTask(task._id)}
                            >
                              Remove Worker
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="site-supervisor-unassigned-message">
                              ⚠ No worker assigned
                            </p>
                            <div className="site-supervisor-assign-controls">
                              <label className="site-supervisor-assign-label">
                                Select Worker to Assign:
                              </label>
                              <select
                                className="site-supervisor-assign-select"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    assignWorkerToTask(
                                      task._id,
                                      e.target.value
                                    );
                                    e.target.value = ""; // Reset select
                                  }
                                }}
                              >
                                <option value="">Choose a worker...</option>
                                {availableWorkers.map((worker) => (
                                  <option key={worker._id} value={worker._id}>
                                    {worker.name} ({worker.email})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        </div>
      )}

      {/* Progress Report Form */}
      {viewMode === "progress" && (
        <div className="create-user-container">
          <h2>Submit Daily Progress Report</h2>
          <form onSubmit={submitProgressReport} className="create-user-form">
            <div className="site-supervisor-form-grid">
              <div className="create-user-form-group">
                <label className="create-user-label">
                  Select Active Project *
                </label>
                <select
                  value={newReport.project}
                  onChange={(e) =>
                    setNewReport({ ...newReport, project: e.target.value })
                  }
                  required
                  className="create-user-select"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} - {p.location} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="create-user-form-group">
                <label className="create-user-label">Date *</label>
                <input
                  type="date"
                  value={newReport.date}
                  onChange={(e) =>
                    setNewReport({ ...newReport, date: e.target.value })
                  }
                  required
                  className="create-user-input"
                />
              </div>
            </div>

            <div className="create-user-form-group">
              <label className="create-user-label">
                Work Completed Today *
              </label>
              <textarea
                value={newReport.workCompleted}
                onChange={(e) =>
                  setNewReport({ ...newReport, workCompleted: e.target.value })
                }
                required
                className="create-user-input"
                placeholder="Describe work completed today..."
              />
            </div>

            <div className="create-user-form-group">
              <label className="create-user-label">
                Overall Progress (%) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newReport.percentageComplete}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    percentageComplete: e.target.value,
                  })
                }
                required
                className="create-user-input"
              />
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${newReport.percentageComplete}%` }}
                />
              </div>
            </div>

            <div className="create-user-form-group">
              <label className="create-user-label">
                Upload Site Photos (Max 10)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadedImages.length >= 10}
                className="create-user-input"
              />

              {uploadedImages.length > 0 && (
                <div className="site-supervisor-images-preview">
                  <p>Uploaded Images ({uploadedImages.length}/10):</p>
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="site-supervisor-image-item">
                      <img
                        src={img}
                        alt={`Site ${idx}`}
                        className="site-supervisor-image-preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="site-supervisor-image-remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="create-user-button-group">
              <button
                type="submit"
                disabled={loading || projects.length === 0}
                className="create-user-submit-btn"
              >
                {loading ? "Submitting..." : "Submit Progress Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Reports View */}
      {viewMode === "reports" && (
        <div className="project-manager-section">
          <h2>Recent Progress Reports</h2>
          <div className="site-supervisor-reports-grid">
            {progressReports.map((report) => (
              <div key={report._id} className="site-supervisor-report-card">
                {editingReport === report._id ? (
                  <div>
                    <h3>Edit Report: {report.project?.name}</h3>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                        Work Completed:
                      </label>
                      <textarea
                        value={editForm.workCompleted}
                        onChange={(e) => setEditForm({ ...editForm, workCompleted: e.target.value })}
                        style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                      />
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
                        Progress (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.percentageComplete}
                        onChange={(e) => setEditForm({ ...editForm, percentageComplete: e.target.value })}
                        style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                      />
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
                    <h3>{report.project?.name}</h3>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(report.date).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Progress:</strong> {report.percentageComplete}%
                    </p>
                    <div className="site-supervisor-report-progress-bar">
                      <div
                        className="site-supervisor-report-progress-fill"
                        style={{ width: `${report.percentageComplete}%` }}
                      />
                    </div>
                    <p>
                      <strong>Work Completed:</strong>
                    </p>
                    <p style={{ fontSize: 14 }}>{report.workCompleted}</p>

                    {report.images && report.images.length > 0 && (
                      <div className="site-supervisor-site-images">
                        <h4>Site Photos:</h4>
                        <div className="site-supervisor-site-images-grid">
                          {report.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Site ${idx}`}
                              className="site-supervisor-site-image"
                              onClick={() => window.open(img, "_blank")}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
                      <button
                        onClick={() => startEditReport(report)}
                        style={{ padding: "8px 16px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReport(report._id)}
                        style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
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
      )}
    </div>
  );
};

export default SiteSupervisorDashboard;

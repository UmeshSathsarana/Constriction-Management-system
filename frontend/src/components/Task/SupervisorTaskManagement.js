import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Dashboard/site.css";
import "./SupervisorTaskManagement.css";

const SupervisorTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supervisorId, setSupervisorId] = useState(null);

  useEffect(() => {
    // Get supervisor ID from localStorage or context
    const user = JSON.parse(localStorage.getItem("authUser") || "{}");
    if (user._id && user.role === "Site Supervisor") {
      setSupervisorId(user._id);
      fetchSupervisorData(user._id);
    } else {
      setError("Access denied. Only Site Supervisors can access this page.");
      setLoading(false);
    }
  }, []);

  const fetchSupervisorData = async (supervisorId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch tasks for supervisor's projects
      const tasksResponse = await axios.get(
        `http://localhost:5000/tasks/supervisor/${supervisorId}`
      );
      setTasks(tasksResponse.data || []);

      // Fetch available workers
      const workersResponse = await axios.get(
        `http://localhost:5000/tasks/supervisor/${supervisorId}/available-workers`
      );
      setAvailableWorkers(workersResponse.data.availableWorkers || []);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching supervisor data:", err);
      setError("Error loading supervisor data");
      setLoading(false);
    }
  };

  const assignWorkerToTask = async (taskId, workerId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/tasks/${taskId}/assign-worker`,
        {
          workerId,
          supervisorId,
        }
      );

      // Update local state
      setTasks(
        tasks.map((task) => (task._id === taskId ? response.data.task : task))
      );

      // Remove worker from available list
      setAvailableWorkers(
        availableWorkers.filter((worker) => worker._id !== workerId)
      );

      alert("Worker assigned successfully!");
    } catch (err) {
      console.error("Error assigning worker:", err);
      alert(
        "Error assigning worker: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const removeWorkerFromTask = async (taskId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/tasks/${taskId}/remove-worker`,
        {
          supervisorId,
        }
      );

      // Update local state
      const updatedTask = response.data.task;
      setTasks(tasks.map((task) => (task._id === taskId ? updatedTask : task)));

      // Add worker back to available list if they exist
      if (updatedTask.assignedTo) {
        const workerExists = availableWorkers.some(
          (w) => w._id === updatedTask.assignedTo._id
        );
        if (!workerExists) {
          setAvailableWorkers([...availableWorkers, updatedTask.assignedTo]);
        }
      }

      alert("Worker removed successfully!");
    } catch (err) {
      console.error("Error removing worker:", err);
      alert(
        "Error removing worker: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#28a745";
      case "In Progress":
        return "#ffc107";
      case "Pending":
        return "#6c757d";
      case "Cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#dc3545";
      case "High":
        return "#fd7e14";
      case "Medium":
        return "#ffc107";
      case "Low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getWorkerStatus = (workerId) => {
    // Check if worker is assigned to any task
    const isAssigned = tasks.some(
      (task) => task.assignedTo && task.assignedTo._id === workerId
    );
    return isAssigned ? "Working" : "Active";
  };

  const getWorkerStatusColor = (status) => {
    return status === "Working" ? "#28a745" : "#007bff";
  };

  if (loading) {
    return (
      <div className="site-supervisor-loading">
        <div>Loading supervisor tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-supervisor-error">
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="site-supervisor-task-management">
      <h2>Site Supervisor - Task Management</h2>

      {/* Available Workers Section */}
      <div className="site-supervisor-section">
        <h3>Available Workers ({availableWorkers.length})</h3>
        {availableWorkers.length === 0 ? (
          <p>No available workers at this time.</p>
        ) : (
          <div className="site-supervisor-workers-grid">
            {availableWorkers.map((worker) => (
              <div key={worker._id} className="site-supervisor-worker-card">
                <h4>{worker.name}</h4>
                <div className="site-supervisor-worker-status">
                  {getWorkerStatus(worker._id)}
                </div>
                {worker.email && (
                  <p>
                    <strong>Email:</strong> {worker.email}
                  </p>
                )}
                {worker.phone && (
                  <p>
                    <strong>Phone:</strong> {worker.phone}
                  </p>
                )}
                {!worker.email && !worker.phone && (
                  <p>
                    <em>No contact info available</em>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="site-supervisor-section">
        <h3>Your Project Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <p>No tasks found in your supervised projects.</p>
        ) : (
          <div className="site-supervisor-tasks-grid">
            {tasks.map((task) => (
              <div key={task._id} className="site-supervisor-task-card">
                <div className="site-supervisor-task-header">
                  <div>
                    <h4>{task.title}</h4>
                    <p className="site-supervisor-task-meta">
                      <strong>Project:</strong> {task.project?.name || "N/A"}
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
                              assignWorkerToTask(task._id, e.target.value);
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
    </div>
  );
};

export default SupervisorTaskManagement;

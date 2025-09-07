import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CreateTask.css";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    equipment: [],
    materials: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskRes, projectsRes, usersRes] = await Promise.all([
          axios.get(`/tasks/${id}`),
          axios.get("/projects"),
          axios.get("/users"),
        ]);

        const task = taskRes.data.task;
        setTaskData({
          title: task.title || "",
          description: task.description || "",
          project: task.project?._id || "",
          assignedTo: task.assignedTo?._id || "",
          priority: task.priority || "Medium",
          startDate: task.startDate ? task.startDate.split("T")[0] : "",
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
          equipment: task.equipment || [],
          materials: task.materials || [],
        });

        setProjects(projectsRes.data.projects || []);
        setUsers(usersRes.data.users || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/tasks/${id}`, taskData);
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating task");
    }
  };

  if (loading) return <div className="create-task-loading">Loading...</div>;
  if (error) return <div className="create-task-error">{error}</div>;

  return (
    <div className="create-task-container">
      <div className="create-task-header">
        <h1 className="create-task-title">Edit Task</h1>
        <p className="create-task-subtitle">Update task details and assignments</p>
      </div>

      <form className="create-task-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="create-task-section">
          <h3 className="create-task-section-title">Basic Information</h3>

          <div className="create-task-form-group">
            <label className="create-task-label create-task-label-required">Title</label>
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              required
              className="create-task-input"
            />
          </div>

          <div className="create-task-form-group">
            <label className="create-task-label">Description</label>
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              className="create-task-textarea"
            />
          </div>
        </div>

        {/* Project and Assignment */}
        <div className="create-task-section">
          <h3 className="create-task-section-title">Project & Assignment</h3>

          <div className="create-task-grid">
            <div className="create-task-form-group">
              <label className="create-task-label create-task-label-required">Project</label>
              <select
                name="project"
                value={taskData.project}
                onChange={handleChange}
                required
                className="create-task-select"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name} - {project.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="create-task-form-group">
              <label className="create-task-label">Assigned To</label>
              <select
                name="assignedTo"
                value={taskData.assignedTo}
                onChange={handleChange}
                className="create-task-select"
              >
                <option value="">Select Employee</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Priority and Dates */}
        <div className="create-task-section">
          <h3 className="create-task-section-title">Priority & Timeline</h3>

          <div className="create-task-grid-3">
            <div className="create-task-form-group">
              <label className="create-task-label">Priority</label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className="create-task-select"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="create-task-form-group">
              <label className="create-task-label create-task-label-required">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={taskData.startDate}
                onChange={handleChange}
                required
                className="create-task-input"
              />
            </div>

            <div className="create-task-form-group">
              <label className="create-task-label create-task-label-required">Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={taskData.dueDate}
                onChange={handleChange}
                required
                className="create-task-input"
              />
            </div>
          </div>
        </div>

        {/* Equipment Section */}
        <div className="equipment-section">
          <h3 className="create-task-section-title">Equipment</h3>
          <div className="create-task-form-group">
            <label className="create-task-label">Equipment Name</label>
            <input
              type="text"
              placeholder="Equipment Name"
              value={taskData.equipment}
              onChange={(e) =>
                setTaskData((prev) => ({ ...prev, equipment: e.target.value }))
              }
              className="create-task-input"
            />
          </div>
        </div>

        {/* Materials Section */}
        <div className="materials-section">
          <h3 className="create-task-section-title">Materials</h3>
          <div className="create-task-form-group">
            <label className="create-task-label">Materials Name</label>
            <input
              type="text"
              placeholder="Materials Name"
              value={taskData.materials}
              onChange={(e) =>
                setTaskData((prev) => ({ ...prev, materials: e.target.value }))
              }
              className="create-task-input"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="create-task-form-actions">
          <button type="submit" className="create-task-submit-btn">
            Update Task
          </button>
          <button
            type="button"
            onClick={() => navigate("/tasks")}
            className="create-task-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;

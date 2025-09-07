// components/Task/CreateTask.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateTask.css";

const CreateTask = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
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
    materials: [],
    equipment: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes, materialsRes, equipmentRes] =
        await Promise.all([
          axios.get("http://localhost:5000/projects"),
          axios.get("http://localhost:5000/users"),
          axios.get("http://localhost:5000/materials"),
          axios.get("http://localhost:5000/equipment"),
        ]);

      setProjects(projectsRes.data.projects || []);
      setUsers(usersRes.data.users || []);
      setMaterialsList(materialsRes.data.materials || []);
      setEquipmentList(equipmentRes.data.equipment || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error loading data");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  // Materials Management
  const addMaterialRow = () => {
    setTaskData((prev) => ({
      ...prev,
      materials: [...prev.materials, { material: "", quantity: 1 }],
    }));
  };

  const removeMaterialRow = (index) => {
    setTaskData((prev) => {
      const updated = [...prev.materials];
      updated.splice(index, 1);
      return { ...prev, materials: updated };
    });
  };

  const handleMaterialChange = (index, field, value) => {
    setTaskData((prev) => {
      const updated = [...prev.materials];
      updated[index][field] = field === "quantity" ? Number(value) : value;
      return { ...prev, materials: updated };
    });
  };

  // Equipment Management
  const addEquipmentRow = () => {
    setTaskData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, { equipment: "", quantity: 1 }],
    }));
  };

  const removeEquipmentRow = (index) => {
    setTaskData((prev) => {
      const updated = [...prev.equipment];
      updated.splice(index, 1);
      return { ...prev, equipment: updated };
    });
  };

  const handleEquipmentChange = (index, field, value) => {
    setTaskData((prev) => {
      const updated = [...prev.equipment];
      updated[index][field] = field === "quantity" ? Number(value) : value;
      return { ...prev, equipment: updated };
    });
  };

  const selectedMaterialIds = taskData.materials.map((m) => m.material);
  const selectedEquipmentIds = taskData.equipment.map((e) => e.equipment);
  const availableEquipment = equipmentList.filter(
    (e) => e.status === "Available"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(taskData.dueDate) < new Date(taskData.startDate)) {
      alert("Due date must be after start date");
      return;
    }

    for (const mat of taskData.materials) {
      if (!mat.material || !mat.quantity || mat.quantity <= 0) {
        alert("Please select materials and enter valid quantities");
        return;
      }
    }

    for (const eq of taskData.equipment) {
      if (!eq.equipment || !eq.quantity || eq.quantity <= 0) {
        alert("Please select equipment and enter valid quantities");
        return;
      }
    }

    try {
      await axios.post("http://localhost:5000/tasks", taskData);
      alert("Task created successfully");
      navigate("/tasks");
      console.log(taskData);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating task");
    }
  };

  if (loading) return <div className="create-task-loading">Loading...</div>;

  return (
    <div className="create-task-container">
      <div className="create-task-header">
        <h1 className="create-task-title">Create New Task</h1>
        <p className="create-task-subtitle">
          Assign resources and set task details
        </p>
      </div>

      {error && <div className="create-task-error">{error}</div>}

      <form className="create-task-form" onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="create-task-section">
          <h3 className="create-task-section-title">Basic Information</h3>

          <div className="create-task-form-group">
            <label className="create-task-label create-task-label-required">
              Title
            </label>
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
              <label className="create-task-label create-task-label-required">
                Project
              </label>
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
              <label className="create-task-label create-task-label-required">
                Start Date
              </label>
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
              <label className="create-task-label create-task-label-required">
                Due Date
              </label>
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

        {/* Materials Section */}
        <div className="materials-section">
          <h3 className="create-task-section-title">Materials Required</h3>
          {taskData.materials.map((mat, idx) => (
            <div key={idx} className="material-row">
              <select
                value={mat.material}
                onChange={(e) =>
                  handleMaterialChange(idx, "material", e.target.value)
                }
                required
                className="create-task-select"
              >
                <option value="">Select Material</option>
                {materialsList.map((m) => (
                  <option
                    key={m._id}
                    value={m._id}
                    disabled={
                      selectedMaterialIds.includes(m._id) &&
                      mat.material !== m._id
                    }
                  >
                    {m.name} ({m.type}) - Available: {m.quantity} {m.unit}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={mat.quantity}
                onChange={(e) =>
                  handleMaterialChange(idx, "quantity", e.target.value)
                }
                required
                className="create-task-input"
              />
              <button
                type="button"
                onClick={() => removeMaterialRow(idx)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMaterialRow}
            disabled={taskData.materials.length >= materialsList.length}
            className="add-btn"
          >
            + Add Material
          </button>
        </div>

        {/* Equipment Section */}
        <div className="equipment-section">
          <h3 className="create-task-section-title">Equipment Required</h3>
          {taskData.equipment.map((eq, idx) => (
            <div key={idx} className="equipment-row">
              <select
                value={eq.equipment}
                onChange={(e) =>
                  handleEquipmentChange(idx, "equipment", e.target.value)
                }
                required
                className="create-task-select"
              >
                <option value="">Select Equipment</option>
                {availableEquipment.map((e) => (
                  <option
                    key={e._id}
                    value={e._id}
                    disabled={
                      selectedEquipmentIds.includes(e._id) &&
                      eq.equipment !== e._id
                    }
                  >
                    {e.name} ({e.type}) - {e.code}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Days Required"
                value={eq.quantity}
                onChange={(e) =>
                  handleEquipmentChange(idx, "quantity", e.target.value)
                }
                required
                className="create-task-input"
              />
              <button
                type="button"
                onClick={() => removeEquipmentRow(idx)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addEquipmentRow}
            disabled={taskData.equipment.length >= availableEquipment.length}
            className="add-btn"
          >
            + Add Equipment
          </button>
        </div>

        {/* Form Actions */}
        <div className="create-task-form-actions">
          <button type="submit" className="create-task-submit-btn">
            Create Task
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

export default CreateTask;

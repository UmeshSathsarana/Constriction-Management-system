import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const CreateProject = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState({
    pid: "",
    name: "",
    description: "",
    location: "", // Required field
    client: "",
    agreement: "",
    projectPlan: "",
    startDate: "",
    endDate: "",
    budget: "",
  });
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/clients");
      setClients(response.data.clients || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("projects", projectData);
      console.log("Project created:", response.data);
      navigate("projects");
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Error creating project");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/projects");
  };

  return (
    <div className="create-project-container">
      <div className="create-project-header">
        <h1 className="create-project-title">Create New Project</h1>
        <p className="create-project-subtitle">
          Fill in the details below to create a new project
        </p>
      </div>

      {error && <div className="create-project-error">{error}</div>}

      <form className="create-project-form" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="create-project-section">
          <h3 className="create-project-section-title">Basic Information</h3>
          <div className="create-project-grid">
            <div className="create-project-form-group">
              <label className="create-project-label create-project-label-required">
                Project ID
              </label>
              <input
                type="text"
                name="pid"
                value={projectData.pid}
                onChange={handleChange}
                className="create-project-input"
                placeholder="Enter project ID"
                required
              />
            </div>
            <div className="create-project-form-group">
              <label className="create-project-label create-project-label-required">
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={projectData.name}
                onChange={handleChange}
                className="create-project-input"
                placeholder="Enter project name"
                required
              />
            </div>
          </div>
          <div className="create-project-form-group">
            <label className="create-project-label">Description</label>
            <textarea
              name="description"
              value={projectData.description}
              onChange={handleChange}
              className="create-project-textarea"
              placeholder="Enter project description"
            />
          </div>
          <div className="create-project-form-group">
            <label className="create-project-label create-project-label-required">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={projectData.location}
              onChange={handleChange}
              className="create-project-input"
              placeholder="Enter project location"
              required
            />
          </div>
        </div>

        {/* Client Information Section */}
        <div className="create-project-section create-project-client-section">
          <h3 className="create-project-section-title">Client Information</h3>
          <div className="create-project-form-group">
            <label className="create-project-label">Select Client</label>
            <select
              name="client"
              value={projectData.client}
              onChange={handleChange}
              className="create-project-select"
            >
              <option value="">Choose a client from the list</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} {client.company ? `(${client.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="create-project-form-group">
            <label className="create-project-label">Agreement Details</label>
            <textarea
              name="agreement"
              value={projectData.agreement}
              onChange={handleChange}
              className="create-project-textarea"
              placeholder="Enter agreement details and terms"
            />
          </div>
        </div>

        {/* Project Planning Section */}
        <div className="create-project-section">
          <h3 className="create-project-section-title">Project Planning</h3>
          <div className="create-project-form-group">
            <label className="create-project-label">Project Plan</label>
            <textarea
              name="projectPlan"
              value={projectData.projectPlan}
              onChange={handleChange}
              className="create-project-textarea"
              placeholder="Enter project plan details"
            />
          </div>
          <div className="create-project-grid-2">
            <div className="create-project-form-group">
              <label className="create-project-label create-project-label-required">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={projectData.startDate}
                onChange={handleChange}
                className="create-project-input"
                required
              />
            </div>
            <div className="create-project-form-group">
              <label className="create-project-label create-project-label-required">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={projectData.endDate}
                onChange={handleChange}
                className="create-project-input"
                required
              />
            </div>
          </div>
          <div className="create-project-form-group">
            <label className="create-project-label create-project-label-required">
              Budget
            </label>
            <input
              type="number"
              name="budget"
              value={projectData.budget}
              onChange={handleChange}
              className="create-project-input"
              placeholder="Enter budget amount"
              min="0"
              required
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="create-project-form-actions">
          <button
            type="submit"
            className="create-project-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
          <button
            type="button"
            className="create-project-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;

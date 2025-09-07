// components/Project/EditProject.js
// components/Project/EditProject.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../Project/CreateProject.css";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    location: "",
    client: "",
    agreement: "",
    projectPlan: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "",
    progress: "",
  });
  const [certificateCode, setCertificateCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project data
        const projectResponse = await axios.get(`/projects/${id}`);
        const project = projectResponse.data.project;

        // Fetch clients for dropdown
        const clientsResponse = await axios.get("/clients");
        setClients(clientsResponse.data.clients || []);

        setProjectData({
          name: project.name || "",
          description: project.description || "",
          location: project.location || "",
          client: project.client?._id || "",
          agreement: project.agreement || "",
          projectPlan: project.projectPlan || "",
          startDate: project.startDate ? project.startDate.split("T")[0] : "",
          endDate: project.endDate ? project.endDate.split("T")[0] : "",
          budget: project.budget || "",
          status: project.status || "Planning",
          progress: project.progress || 0,
        });

        // Set selected client for auto-fill
        if (project.client) {
          setSelectedClient(project.client);
        }

        setLoading(false);
      } catch (err) {
        setError("Error fetching project data");
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c._id === clientId);

    setProjectData((prev) => ({
      ...prev,
      client: clientId,
    }));

    setSelectedClient(client);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...projectData };

      // Include certificate code if provided
      if (certificateCode.trim()) {
        updateData.certificateCode = certificateCode;
      }

      await axios.put(`/projects/${id}`, updateData);
      alert("Project updated successfully");
      navigate(`/project/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating project");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="create-project-container">
      <div className="create-project-header">
        <h1 className="create-project-title">Edit Project</h1>
        <p className="create-project-subtitle">
          Update project details below
        </p>
      </div>

      {error && <div className="create-project-error">{error}</div>}

      <form className="create-project-form" onSubmit={handleSubmit}>
        <div className="create-project-section">
          <h3 className="create-project-section-title">Basic Information</h3>
          <div className="create-project-grid">
            <div className="create-project-form-group">
              <label className="create-project-label">Project Name *</label>
              <input
                type="text"
                name="name"
                value={projectData.name}
                onChange={handleChange}
                className="create-project-input"
                required
              />
            </div>

            <div className="create-project-form-group">
              <label className="create-project-label">Location *</label>
              <input
                type="text"
                name="location"
                value={projectData.location}
                onChange={handleChange}
                className="create-project-input"
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
              className="create-project-input"
              rows="4"
            />
          </div>

          <div className="create-project-form-group">
            <label className="create-project-label">Client</label>
            <select
              name="client"
              value={projectData.client}
              onChange={handleClientChange}
              className="create-project-input"
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} {client.company ? `(${client.company})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Client Details Auto-fill */}
          {selectedClient && (
            <div className="create-project-info-box">
              <h4>Client Details:</h4>
              <div className="create-project-info-grid">
                <div><strong>Name:</strong> {selectedClient.name}</div>
                <div><strong>Company:</strong> {selectedClient.company || "N/A"}</div>
                <div><strong>Email:</strong> {selectedClient.email}</div>
                <div><strong>Phone:</strong> {selectedClient.phone || "N/A"}</div>
                <div><strong>Address:</strong> {selectedClient.address || "N/A"}</div>
                <div><strong>Contact Person:</strong> {selectedClient.contactPerson || "N/A"}</div>
              </div>
            </div>
          )}
        </div>

        <div className="create-project-section">
          <h3 className="create-project-section-title">Agreement & Project Plan</h3>
          <div className="create-project-form-group">
            <label className="create-project-label">Agreement</label>
            <textarea
              name="agreement"
              value={projectData.agreement}
              onChange={handleChange}
              className="create-project-input"
              rows="4"
              placeholder="Enter agreement details"
            />
          </div>

          <div className="create-project-form-group">
            <label className="create-project-label">Project Plan</label>
            <textarea
              name="projectPlan"
              value={projectData.projectPlan}
              onChange={handleChange}
              className="create-project-input"
              rows="4"
              placeholder="Enter project plan details"
            />
          </div>

          <div className="create-project-form-group">
            <label className="create-project-label">Certificate Code (for updates)</label>
            <input
              type="password"
              value={certificateCode}
              onChange={(e) => setCertificateCode(e.target.value)}
              className="create-project-input"
              placeholder="Enter certificate code if required"
            />
            <small className="create-project-help">
              Required if certificate code is set for this project
            </small>
          </div>
        </div>

        <div className="create-project-section">
          <h3 className="create-project-section-title">Timeline & Budget</h3>
          <div className="create-project-grid">
            <div className="create-project-form-group">
              <label className="create-project-label">Start Date *</label>
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
              <label className="create-project-label">End Date *</label>
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
            <label className="create-project-label">Budget (Rs.) *</label>
            <input
              type="number"
              name="budget"
              value={projectData.budget}
              onChange={handleChange}
              className="create-project-input"
              min="0"
              step="1000"
              required
            />
          </div>
        </div>

        <div className="create-project-section">
          <h3 className="create-project-section-title">Status & Progress</h3>
          <div className="create-project-grid">
            <div className="create-project-form-group">
              <label className="create-project-label">Status</label>
              <select
                name="status"
                value={projectData.status}
                onChange={handleChange}
                className="create-project-input"
              >
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="create-project-form-group">
              <label className="create-project-label">Progress (%)</label>
              <input
                type="number"
                name="progress"
                value={projectData.progress}
                onChange={handleChange}
                className="create-project-input"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>



        <div className="create-project-actions">
          <button type="submit" className="create-project-submit-btn">
            Update Project
          </button>
          <button
            type="button"
            onClick={() => navigate(`/project/${id}`)}
            className="create-project-cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;

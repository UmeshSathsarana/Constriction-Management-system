// components/Project/ProjectDetails.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./ProjectDetails.css";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`/projects/${id}`);
        setProject(response.data.project);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(
          err.response?.data?.message || "Error fetching project details"
        );
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-details-container">
      <div className="project-details-view">
        {/* Header Section */}
        <div className="project-details-header">
          <div className="project-avatar">
            {project.name ? project.name.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="project-details-info">
            <h2>{project.name}</h2>
            <p>{project.location}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="project-details-content">
          {/* Description */}
          <div className="project-detail-item">
            <h4>Description</h4>
            <p>{project.description || "No description provided"}</p>
          </div>

          {/* Budget */}
          <div className="project-detail-item">
            <h4>Budget</h4>
            <p>Rs. {project.budget?.toLocaleString()}</p>
          </div>

          {/* Start Date */}
          <div className="project-detail-item">
            <h4>Start Date</h4>
            <p>{new Date(project.startDate).toLocaleDateString()}</p>
          </div>

          {/* End Date */}
          <div className="project-detail-item">
            <h4>End Date</h4>
            <p>{new Date(project.endDate).toLocaleDateString()}</p>
          </div>

          {/* Status */}
          <div className="project-detail-item">
            <h4>Status</h4>
            <p>
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </p>
          </div>

          {/* Materials */}
          <div className="project-detail-item materials">
            <h4>Materials Required</h4>
            <p>{project.materials || "Materials information not available"}</p>
          </div>

          {/* Progress Section */}
          <div className="progress-section">
            <h4>Project Progress</h4>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
            <div className="progress-text">{project.progress || 0}% Complete</div>
          </div>

          {/* Team Section */}
          {(project.client || project.projectManager) && (
            <div className="team-section">
              <h4>Team & Client</h4>
              {project.client && (
                <div className="team-member">
                  <div className="team-member-avatar">
                    {project.client.name ? project.client.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="team-member-info">
                    <h5>{project.client.name}</h5>
                    <p>Client - {project.client.company}</p>
                  </div>
                </div>
              )}
              {project.projectManager && (
                <div className="team-member">
                  <div className="team-member-avatar">
                    {project.projectManager.name ? project.projectManager.name.charAt(0).toUpperCase() : "M"}
                  </div>
                  <div className="team-member-info">
                    <h5>{project.projectManager.name}</h5>
                    <p>Project Manager</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="project-details-actions">
            <Link to={`/edit-project/${project._id}`}>
              <button className="project-details-btn edit-btn">Edit Project</button>
            </Link>
            <Link to="/projects">
              <button className="project-details-btn back-btn">Back to List</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

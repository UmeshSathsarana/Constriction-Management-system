import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import '../Dashboard/project.css';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/projects"); // Will use baseURL from index.js
        if (response.data && response.data.projects) {
          setProjects(response.data.projects);
        } else {
          setProjects([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return (
    <div className="project-list-loading">
      <div className="loading-spinner">Loading projects...</div>
    </div>
  );

  if (error) return (
    <div className="project-list-error">
      <div className="error-message">{error}</div>
    </div>
  );

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h2>All Projects</h2>
        <Link to="/create-project" className="project-list-create-btn">Create New Project</Link>
      </div>

      {projects.length === 0 ? (
        <div className="project-list-empty">
          <p>No projects found. Create your first project!</p>
        </div>
      ) : (
        <ul className="project-list-ul">
          {projects.map((project) => (
            <li key={project._id} className="project-list-item">
              <Link to={`/project/${project._id}`} className="project-list-link">{project.name}</Link>
              <span className="project-list-location">{project.location}</span>
              <Link to={`/edit-project/${project._id}`} className="project-list-edit-link">Edit</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;

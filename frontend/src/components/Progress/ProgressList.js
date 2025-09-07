import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProgressList = () => {
  const [progressReports, setProgressReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchProgress();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProgressByProject(selectedProject);
    } else {
      fetchProgress();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data.projects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/progress/latest');
      setProgressReports(response.data.latestProgress);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setLoading(false);
    }
  };

  const fetchProgressByProject = async (projectId) => {
    try {
      const response = await axios.get(`/progress/project/${projectId}`);
      setProgressReports(response.data.progressReports);
    } catch (err) {
      console.error('Error fetching project progress:', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="progress-list">
      <h2>Progress Reports</h2>
      
      <div className="filters">
        <select 
          value={selectedProject} 
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">All Projects</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="progress-grid">
        {progressReports.map((report) => (
          <div key={report._id} className="progress-card">
            <h3>{report.project?.name || 'Unknown Project'}</h3>
            <p>Date: {new Date(report.date).toLocaleDateString()}</p>
            <p>Progress: {report.percentageComplete}%</p>
            <p>Status: {report.status}</p>
            <p>Reported by: {report.reportedBy?.name}</p>
            <Link to={`/progress/${report._id}`} className="btn-small">View Details</Link>
          </div>
        ))}
      </div>

      {selectedProject && (
        <Link to={`/create-progress/${selectedProject}`} className="btn btn-primary">
          Add Progress Report
        </Link>
      )}
    </div>
  );
};

export default ProgressList;

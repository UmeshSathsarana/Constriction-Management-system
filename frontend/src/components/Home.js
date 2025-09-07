import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    users: 0,
    clients: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes, usersRes, clientsRes] = await Promise.all([
        axios.get("/projects"),
        axios.get("/tasks"),
        axios.get("/users"),
        axios.get("/clients"),
      ]);

      setStats({
        projects: projectsRes.data.projects?.length || 0,
        tasks: tasksRes.data.tasks?.length || 0,
        users: usersRes.data.users?.length || 0,
        clients: clientsRes.data.clients?.length || 0,
      });

      setRecentProjects(projectsRes.data.projects?.slice(0, 5) || []);
      setRecentTasks(tasksRes.data.tasks?.slice(0, 5) || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Construction Management Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-number">{stats.projects}</p>
          <Link to="/projects" className="stat-link">
            View All
          </Link>
        </div>

        <div className="stat-card">
          <h3>Tasks</h3>
          <p className="stat-number">{stats.tasks}</p>
          <Link to="/tasks" className="stat-link">
            View All
          </Link>
        </div>

        <div className="stat-card">
          <h3>Employees</h3>
          <p className="stat-number">{stats.users}</p>
          <Link to="/users" className="stat-link">
            View All
          </Link>
        </div>

        <div className="stat-card">
          <h3>Clients</h3>
          <p className="stat-number">{stats.clients}</p>
          <Link to="/clients" className="stat-link">
            View All
          </Link>
        </div>
      </div>

      <div className="recent-section">
        <div className="recent-projects">
          <h2>Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <p>No projects yet</p>
          ) : (
            <ul>
              {recentProjects.map((project) => (
                <li key={project._id}>
                  <Link to={`/project/${project._id}`}>
                    {project.name} - {project.location}
                  </Link>
                  <span className="status">{project.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="recent-tasks">
          <h2>Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p>No tasks yet</p>
          ) : (
            <ul>
              {recentTasks.map((task) => (
                <li key={task._id}>
                  <Link to={`/task/${task._id}`}>{task.title}</Link>
                  <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/create-project" className="action-btn">
            New Project
          </Link>
          <Link to="/create-task" className="action-btn">
            New Task
          </Link>
          <Link to="/create-user" className="action-btn">
            Add Employee
          </Link>
          <Link to="/create-client" className="action-btn">
            Add Client
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

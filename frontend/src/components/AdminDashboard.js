// components/AdminDashboard.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./Dashboard/dashboard2.css";

const AdminDashboard = ({ authUser, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState("overview");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [recentProgress, setRecentProgress] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "Worker",
    phone: "",
    address: "",
    isActive: true,
  });
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const performInitialFetch = async () => {
      await fetchAllData();
      setLastUpdateTime(new Date());
    };

    performInitialFetch();

    // Real-time updates every 30 seconds (reduced frequency)
    const interval = setInterval(async () => {
      await fetchAllData();
      setLastUpdateTime(new Date());
    }, 30000); // Changed from 5000ms to 30000ms

    return () => clearInterval(interval);
  }, []);

  // Check for tab query parameter to set initial active view
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      [
        "overview",
        "users",
        "projects",
        "clients",
        "tasks",
        "profile",
        "reports",
      ].includes(tab)
    ) {
      setActiveView(tab);
    }
  }, [searchParams]);

  const fetchAllData = useCallback(async () => {
    try {
      setError(null);
      setIsRefreshing(true);

      const [
        usersRes,
        projectsRes,
        tasksRes,
        clientsRes,
        progressRes,
        reportsRes,
      ] = await Promise.all([
        axios.get("http://localhost:5000/users"),
        axios.get("http://localhost:5000/projects"),
        axios.get("http://localhost:5000/tasks"),
        axios.get("http://localhost:5000/clients"),
        axios.get("http://localhost:5000/progress/latest"),
        axios.get("http://localhost:5000/reports"),
      ]);

      const usersData = usersRes.data.users || [];
      const projectsData = projectsRes.data.projects || [];
      const tasksData = tasksRes.data.tasks || [];
      const clientsData = clientsRes.data.clients || [];
      const progressData = progressRes.data.latestProgress || [];

      // Enhanced projects with task counts and progress
      const enhancedProjects = projectsData.map((project) => {
        const projectTasks = tasksData.filter(
          (t) => t.project?._id === project._id
        );
        const completedTasks = projectTasks.filter(
          (t) => t.status === "Completed"
        ).length;
        const progress =
          projectTasks.length > 0
            ? Math.round((completedTasks / projectTasks.length) * 100)
            : 0;
        const projectProgress = progressData.filter(
          (p) => p.project?._id === project._id
        );
        const latestProgress = projectProgress[0];

        return {
          ...project,
          totalTasks: projectTasks.length,
          completedTasks: completedTasks,
          calculatedProgress: progress,
          latestProgress: latestProgress,
        };
      });

      // Enhanced users with task assignments
      const enhancedUsers = usersData.map((user) => {
        const userTasks = tasksData.filter(
          (t) => t.assignedTo?._id === user._id
        );
        return {
          ...user,
          assignedTasks: userTasks.length,
          completedTasks: userTasks.filter((t) => t.status === "Completed")
            .length,
          pendingTasks: userTasks.filter((t) => t.status === "Pending").length,
        };
      });

      setUsers(enhancedUsers);
      setProjects(enhancedProjects);
      setTasks(tasksData);
      setClients(clientsData);
      setRecentProgress(progressData);
      setReports(reportsRes.data.reports || []);

      setStats({
        totalUsers: usersData.length,
        activeUsers: usersData.filter((u) => u.isActive).length,
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter(
          (p) => p.status === "Active" || p.status === "In Progress"
        ).length,
        completedProjects: projectsData.filter((p) => p.status === "Completed")
          .length,
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter((t) => t.status === "Completed")
          .length,
        totalRevenue: 0,
        totalExpenses: 0,
      });

      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Memoized expensive calculations
  const taskStats = useMemo(
    () => ({
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      pending: tasks.filter((t) => t.status === "Pending").length,
    }),
    [tasks]
  );

  const userRoleStats = useMemo(
    () => ({
      admin: users.filter((u) => u.role === "Admin").length,
      manager: users.filter((u) => u.role === "Project Manager").length,
      supervisor: users.filter((u) => u.role === "Site Supervisor").length,
    }),
    [users]
  );

  const usersWithTasks = useMemo(
    () => users.filter((u) => u.assignedTasks > 0),
    [users]
  );

  // Manual refresh function
  const handleManualRefresh = useCallback(() => {
    fetchAllData();
    setLastUpdateTime(new Date());
  }, [fetchAllData]);

  // Notification Functions
  const sendWhatsAppSMS = async (phone, message) => {
    try {
      // Free alternative: Use WhatsApp Web URL to open chat (user must send manually)
      const whatsappUrl = `https://wa.me/${phone.replace(
        /\D/g,
        ""
      )}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      console.log("WhatsApp message link opened:", whatsappUrl);
      return true;
    } catch (error) {
      console.error("Error opening WhatsApp message link:", error);
      return false;
    }
  };

  const sendEmail = async (to, subject, body) => {
    try {
      // Free alternative: Use mailto link to open default email client
      const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      console.log("Email client opened with mailto link:", mailtoLink);
      return true;
    } catch (error) {
      console.error("Error opening email client:", error);
      return false;
    }
  };

  const sendUserNotifications = async (userData) => {
    const userMessage = `Hello ${userData.name}!

Welcome to our Construction Management System!

Your account has been created successfully.

Login Details:
Email: ${userData.email}
Password: ${userData.password}
Role: ${userData.role}

Please change your password after first login for security.

Best regards,
Construction Management Team`;

    const adminMessage = `New User Created

User Details:
Name: ${userData.name}
Email: ${userData.email}
Phone: ${userData.phone || "Not provided"}
Role: ${userData.role}
Address: ${userData.address || "Not provided"}

The user has been notified with their login credentials.

Best regards,
System Admin`;

    // Send WhatsApp SMS to user if phone is provided
    if (userData.phone) {
      await sendWhatsAppSMS(userData.phone, userMessage);
    }

    // Send email to user
    await sendEmail(
      userData.email,
      "Welcome to Construction Management System",
      userMessage
    );

    // Send notification to admin
    await sendEmail(
      authUser?.email || "admin@construction.com",
      "New User Created",
      adminMessage
    );

    // Send WhatsApp SMS to admin if phone is available
    if (authUser?.phone) {
      await sendWhatsAppSMS(authUser.phone, adminMessage);
    }
  };

  // User Management Functions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/users", newUser);

      // Send notifications after successful user creation
      await sendUserNotifications(newUser);

      alert(
        "User created successfully! Notification links opened for user and admin."
      );
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "Worker",
        phone: "",
        address: "",
        isActive: true,
      });
      fetchAllData();
    } catch (err) {
      alert(
        "Error creating user: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5000/users/${userId}`);
        alert("User deleted successfully!");
        fetchAllData();
      } catch (err) {
        alert(
          "Error deleting user: " + (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.patch(`http://localhost:5000/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      fetchAllData();
    } catch (err) {
      alert("Error updating user status");
    }
  };

  // Project Management Functions
  const handleDeleteProject = async (projectId, projectName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the project "${projectName}"? This action cannot be undone.`
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/projects/${projectId}`);
        alert("Project deleted successfully!");
        fetchAllData();
      } catch (err) {
        alert(
          "Error deleting project: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  // Client Management Functions
  const handleDeleteClient = async (clientId, clientName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the client "${clientName}"? This action cannot be undone.`
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/clients/${clientId}`);
        alert("Client deleted successfully!");
        fetchAllData();
      } catch (err) {
        alert(
          "Error deleting client: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {authUser?.name || "Admin"}</p>
          <p className="last-update">
            Real-time updates • Last refreshed:{" "}
            {lastUpdateTime.toLocaleTimeString()}
          </p>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeView === "overview" ? "active" : ""}`}
          onClick={() => {
            setActiveView("overview");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "overview");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          Overview
        </button>
        <button
          className={`nav-tab ${activeView === "users" ? "active" : ""}`}
          onClick={() => {
            setActiveView("users");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "users");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          User Management ({stats.totalUsers})
        </button>
        <button
          className={`nav-tab ${activeView === "projects" ? "active" : ""}`}
          onClick={() => {
            setActiveView("projects");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "projects");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          Projects ({stats.totalProjects})
        </button>
        <button
          className={`nav-tab ${activeView === "clients" ? "active" : ""}`}
          onClick={() => {
            setActiveView("clients");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "clients");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          Client Management ({clients.length})
        </button>
        <button
          className={`nav-tab ${activeView === "tasks" ? "active" : ""}`}
          onClick={() => {
            setActiveView("tasks");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "tasks");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          Tasks ({stats.totalTasks})
        </button>
        <button
          className={`nav-tab ${activeView === "profile" ? "active" : ""}`}
          onClick={() => {
            setActiveView("profile");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "profile");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          Profile
        </button>
        <button
          className={`nav-tab ${activeView === "reports" ? "active" : ""}`}
          onClick={() => {
            setActiveView("reports");
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set("tab", "reports");
            navigate(`?${newSearchParams.toString()}`, { replace: true });
          }}
        >
          Reports ({reports.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeView === "overview" && (
        <div>
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
              <p className="stat-subtext">Active: {stats.activeUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Active Projects</h3>
              <p className="stat-number">{stats.activeProjects}</p>
              <p className="stat-subtext">Total: {stats.totalProjects}</p>
            </div>
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <p className="stat-number">{stats.totalTasks}</p>
              <p className="stat-subtext">Completed: {stats.completedTasks}</p>
            </div>

          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeView === "users" && (
        <div>
          <div className="user-management">
            <h2>User Management</h2>
            <button
              className="add-user-btn"
              onClick={() => navigate("/add-user")}
            >
              + Add New User
            </button>
          </div>
          <div className="user-stats-grid">
            <div className="user-stat-card">
              <h4>Total Users</h4>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="user-stat-card active">
              <h4>Active</h4>
              <p className="stat-number">{stats.activeUsers}</p>
            </div>
            <div className="user-stat-card admin">
              <h4>Admins</h4>
              <p className="stat-number">{userRoleStats.admin}</p>
            </div>
            <div className="user-stat-card manager">
              <h4>Project Managers</h4>
              <p className="stat-number">{userRoleStats.manager}</p>
            </div>
            <div className="user-stat-card supervisor">
              <h4>Site Supervisors</h4>
              <p className="stat-number">{userRoleStats.supervisor}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr className="table-header">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Tasks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="table-row">
                    <td>
                      <button
                        className="link-button"
                        onClick={() => navigate(`/user/${user._id}`)}
                      >
                        {user.name}
                      </button>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span
                        className={`role-badge ${user.role
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>{user.address || "-"}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      <div className="task-info">
                        Total: {user.assignedTasks || 0}
                        <br />
                        Completed: {user.completedTasks || 0}
                        <br />
                        Pending: {user.pendingTasks || 0}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`status-btn ${
                          user.isActive ? "active" : "inactive"
                        }`}
                        onClick={() =>
                          handleToggleUserStatus(user._id, user.isActive)
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => navigate(`/user/${user._id}`)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => navigate(`/edit-user/${user._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeView === "projects" && (
        <div>
          <div className="project-management">
            <h2>Project Management</h2>
            <button
              onClick={() => navigate("/create-project")}
              className="add-project-button"
            >
              + Add New Project
            </button>
          </div>

          {/* Project Stats */}
          <div className="project-stats-grid">
            <div className="project-stat-card">
              <h4>Total Projects</h4>
              <p className="stat-number">{stats.totalProjects}</p>
            </div>
            <div className="project-stat-card active">
              <h4>Active Projects</h4>
              <p className="stat-number">{stats.activeProjects}</p>
            </div>
            <div className="project-stat-card completed">
              <h4>Completed Projects</h4>
              <p className="stat-number">{stats.completedProjects}</p>
            </div>
            <div className="project-stat-card">
              <h4>Total Budget</h4>
              <p className="stat-number">
                Rs.{" "}
                {projects
                  .reduce((sum, p) => sum + (p.budget || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>

          {/* Projects Table */}
          <div className="projects-table-container">
            <table className="projects-table">
              <thead>
                <tr className="table-header">
                  <th>Name</th>
                  <th>Location</th>
                  <th>Client</th>
                  <th>Manager</th>
                  <th>Budget</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id} className="table-row">
                    <td>{project.name}</td>
                    <td>{project.location}</td>
                    <td>{project.client?.name || "N/A"}</td>
                    <td>{project.manager?.name || "N/A"}</td>
                    <td>Rs. {project.budget?.toLocaleString()}</td>
                    <td>
                      <div className="progress-info">
                        {project.calculatedProgress || 0}%
                        <div className="progress-bar-inline">
                          <div
                            className="progress-fill-inline"
                            style={{
                              width: `${project.calculatedProgress || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          project.status === "Active" ||
                          project.status === "In Progress"
                            ? "active"
                            : project.status === "Completed"
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/project/${project._id}`}>
                          <button className="action-btn view">View</button>
                        </Link>
                        <Link to={`/edit-project/${project._id}`}>
                          <button className="action-btn edit">Edit</button>
                        </Link>
                        <button
                          className="action-btn delete"
                          onClick={() =>
                            handleDeleteProject(project._id, project.name)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Client Management Tab */}
      {activeView === "clients" && (
        <div>
          <div className="client-management">
            <h2>Client Management</h2>
            <button
              onClick={() => navigate("/create-client")}
              className="add-client-button"
            >
              + Add New Client
            </button>
          </div>

          {/* Client Stats */}
          <div className="client-stats-grid">
            <div className="client-stat-card">
              <h4>Total Clients</h4>
              <p className="stat-number">{clients.length}</p>
            </div>
            <div className="client-stat-card active">
              <h4>Active Clients</h4>
              <p className="stat-number">
                {clients.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="client-stat-card">
              <h4>Total Projects</h4>
              <p className="stat-number">
                {clients.reduce((sum, c) => sum + (c.projects?.length || 0), 0)}
              </p>
            </div>
            <div className="client-stat-card">
              <h4>Total Revenue</h4>
              <p className="stat-number">
                Rs.{" "}
                {clients
                  .reduce((sum, c) => sum + (c.totalRevenue || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>

          {/* Clients Table */}
          <div className="clients-table-container">
            <table className="clients-table">
              <thead>
                <tr className="table-header">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Projects</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="table-row">
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone || "N/A"}</td>
                    <td>{client.company || "N/A"}</td>
                    <td>{client.projects?.length || 0}</td>
                    <td>Rs. {(client.totalRevenue || 0).toLocaleString()}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          client.isActive ? "active" : "inactive"
                        }`}
                      >
                        {client.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/client/${client._id}`}>
                          <button className="action-btn view">View</button>
                        </Link>
                        <Link to={`/edit-client/${client._id}`}>
                          <button className="action-btn edit">Edit</button>
                        </Link>
                        <button
                          className="action-btn delete"
                          onClick={() =>
                            handleDeleteClient(client._id, client.name)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeView === "tasks" && (
        <div>
          <h2>Task Overview</h2>

          {/* Task Statistics */}
          <div className="task-stats-grid">
            <div className="task-stat-card total">
              <h4>Total Tasks</h4>
              <p className="task-stat-number">{stats.totalTasks}</p>
            </div>
            <div className="task-stat-card completed">
              <h4>Completed</h4>
              <p className="task-stat-number">{stats.completedTasks}</p>
            </div>
            <div className="task-stat-card in-progress">
              <h4>In Progress</h4>
              <p className="task-stat-number">{taskStats.inProgress}</p>
            </div>
            <div className="task-stat-card pending">
              <h4>Pending</h4>
              <p className="task-stat-number">{taskStats.pending}</p>
            </div>
          </div>

          {/* Tasks by User */}
          <h3>Task Assignments by User</h3>
          <div className="task-assignments-grid">
            {usersWithTasks.map((user) => (
              <div key={user._id} className="task-assignment-card">
                <h4>{user.name}</h4>
                <p className="user-role">{user.role}</p>
                <div className="task-assignment-details">
                  <div className="task-assignment-row">
                    <span>Tasks:</span>
                    <span>{user.assignedTasks}</span>
                  </div>
                  <div className="task-assignment-row">
                    <span>Completed:</span>
                    <span className="completed-count">
                      {user.completedTasks}
                    </span>
                  </div>
                  <div className="task-assignment-row">
                    <span>Pending:</span>
                    <span className="pending-count">{user.pendingTasks}</span>
                  </div>
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => navigate(`/user/${user._id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeView === "profile" && (
        <div className="user-profile-view">
          <div className="user-profile-header">
            <div className="user-avatar">
              {authUser?.name ? authUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="user-profile-info">
              <h2>{authUser?.name || "User"}</h2>
              <p>{authUser?.email}</p>
            </div>
          </div>
          <div className="user-profile-details">
            <div className="profile-detail-item">
              <h4>Role</h4>
              <p>{authUser?.role || "N/A"}</p>
            </div>
            <div className="profile-detail-item">
              <h4>Address</h4>
              <p>{authUser?.address || "N/A"}</p>
            </div>
            <div className="profile-detail-item">
              <h4>Phone</h4>
              <p>{authUser?.phone || "N/A"}</p>
            </div>
            <div className="profile-detail-item">
              <h4>Status</h4>
              <p>{authUser?.isActive ? "Active" : "Inactive"}</p>
            </div>
          </div>
          <div className="user-profile-actions">
            {/* Removed Edit and Delete buttons as per user request */}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeView === "reports" && (
        <div>
          <h2>Reports</h2>
          {reports.length === 0 ? (
            <p>No reports available.</p>
          ) : (
            <div className="reports-container">
              <div className="reports-grid">
                {reports.map((report, index) => (
                  <div key={report._id || index} className="report-card">
                    <h3>{report.title || `Report ${index + 1}`}</h3>
                    <div className="report-details">
                      <p>
                        <strong>Type:</strong> {report.type || "N/A"}
                      </p>
                      <p>
                        <strong>Generated:</strong>{" "}
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p>
                        <strong>Description:</strong>{" "}
                        {report.description || "No description available"}
                      </p>
                      {report.data && (
                        <div className="report-data">
                          <h4>Report Data:</h4>
                          <pre>{JSON.stringify(report.data, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

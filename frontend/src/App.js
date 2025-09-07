// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css"; // Import app-specific CSS
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProjectManagerDashboard from "./components/Dashboard/ProjectManagerDashboard";
import SiteSupervisorDashboard from "./components/Dashboard/SiteSupervisorDashboard";
import InventoryDashboard from "./components/Dashboard/InventoryDashboard";
import ClientDashboard from "./components/Dashboard/ClientDashboard";

// User components
import UserList from "./components/User/UserList";
import UserProfile from "./components/User/UserProfile";
import EditUser from "./components/User/EditUser";
import AddUser from "./components/User/AddUser";
import ChangePassword from "./components/User/ChangePassword";

// Task components
import TaskList from "./components/Task/TaskList";
import CreateTask from "./components/Task/CreateTask";
import EditTask from "./components/Task/EditTask";
import TaskDetails from "./components/Task/TaskDetails";
import SupervisorTaskManagement from "./components/Task/SupervisorTaskManagement";

// Project components
import ProjectList from "./components/Project/ProjectList";
import CreateProject from "./components/Project/CreateProject";
import EditProject from "./components/Project/EditProject";
import ProjectDetails from "./components/Project/ProjectDetails";

// Material components
import MaterialList from "./components/Material/MaterialList";
import CreateMaterial from "./components/Material/CreateMaterial";
import EditMaterial from "./components/Material/EditMaterial";
import MaterialDetails from "./components/Material/MaterialDetails";

// Equipment components
import EquipmentList from "./components/Equipment/EquipmentList";
import CreateEquipment from "./components/Equipment/CreateEquipment";
import EditEquipment from "./components/Equipment/EditEquipment";
import EquipmentDetails from "./components/Equipment/EquipmentDetails";

// Client components [[4]]
import ClientList from "./components/Client/ClientList";
import CreateClient from "./components/Client/CreateClient";
import EditClient from "./components/Client/EditClient";
import ClientDetails from "./components/Client/ClientDetails";
import ClientProjects from "./components/Client/ClientProjects";
import ClientProgressReports from "./components/Client/ClientProgressReports";
import ClientProfile from "./components/Client/ClientProfile";
import ClientReports from "./components/Client/ClientReports";

// Progress components [[10]]
import ProgressList from "./components/Progress/ProgressList";
import CreateProgress from "./components/Progress/CreateProgress";
import ProgressReportDetails from "./components/ProgressReportDetails";



function App() {
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (authUser) {
      localStorage.setItem("authUser", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
    }
  }, [authUser]);

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.clear();
    // Clear axios authorization header
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!authUser) return <Navigate to="/login" replace />;
    if (allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
      <Route
        path="/admin/login"
        element={<Login setAuthUser={setAuthUser} />}
      />
      <Route
        path="/"
        element={
          authUser ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {authUser?.role === "Admin" && (
              <AdminDashboard authUser={authUser} onLogout={handleLogout} />
            )}
            {authUser?.role === "Project Manager" && (
              <ProjectManagerDashboard
                authUser={authUser}
                onLogout={handleLogout}
              />
            )}
            {authUser?.role === "Site Supervisor" && (
              <SiteSupervisorDashboard
                authUser={authUser}
                onLogout={handleLogout}
              />
            )}
            {authUser?.role === "Inventory Manager" && (
              <InventoryDashboard authUser={authUser} onLogout={handleLogout} />
            )}
            {authUser?.role === "Worker" && (
              <div>Worker Dashboard - Coming Soon</div>
            )}
            {authUser?.role === "Client" && (
              <ClientDashboard authUser={authUser} onLogout={handleLogout} />
            )}
          </ProtectedRoute>
        }
      />

      {/* Specific Dashboard Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard authUser={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pm/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Project Manager"]}>
            <ProjectManagerDashboard
              authUser={authUser}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Site Supervisor"]}>
            <SiteSupervisorDashboard
              authUser={authUser}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Inventory Manager"]}>
            <InventoryDashboard authUser={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* User Management Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-user"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AddUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-user/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <EditUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword authUser={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Task Management Routes */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/task/:id"
        element={
          <ProtectedRoute>
            <TaskDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-task"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Project Manager"]}>
            <CreateTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-task/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Project Manager"]}>
            <EditTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/supervisor/tasks"
        element={
          <ProtectedRoute allowedRoles={["Site Supervisor"]}>
            <SupervisorTaskManagement />
          </ProtectedRoute>
        }
      />

      {/* Project Management Routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-project"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Project Manager"]}>
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-project/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Project Manager"]}>
            <EditProject />
          </ProtectedRoute>
        }
      />

      {/* Material Management Routes [[6]] */}
      <Route
        path="/materials"
        element={
          <ProtectedRoute>
            <MaterialList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/material/:id"
        element={
          <ProtectedRoute>
            <MaterialDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-material"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Inventory Manager"]}>
            <CreateMaterial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-material/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Inventory Manager"]}>
            <EditMaterial />
          </ProtectedRoute>
        }
      />

      {/* Equipment Management Routes [[8]] */}
      <Route
        path="/equipment"
        element={
          <ProtectedRoute>
            <EquipmentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id"
        element={
          <ProtectedRoute>
            <EquipmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-equipment"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Inventory Manager"]}>
            <CreateEquipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-equipment/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Inventory Manager"]}>
            <EditEquipment />
          </ProtectedRoute>
        }
      />

      {/* Client Management Routes [[4]] */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/:id"
        element={
          <ProtectedRoute>
            <ClientDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-client"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Project Manager"]}>
            <CreateClient />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-client/:id"
        element={
          <ProtectedRoute allowedRoles={["Admin", "Project Manager"]}>
            <EditClient />
          </ProtectedRoute>
        }
      />

      {/* Client Dashboard Routes */}
      <Route
        path="/client/projects"
        element={
          <ProtectedRoute allowedRoles={["Client"]}>
            <ClientProjects authUser={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/progress"
        element={
          <ProtectedRoute allowedRoles={["Client"]}>
            <ClientProgressReports
              authUser={authUser}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/profile"
        element={
          <ProtectedRoute allowedRoles={["Client"]}>
            <ClientProfile authUser={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/project/:id"
        element={
          <ProtectedRoute allowedRoles={["Client"]}>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/project/:id/progress"
        element={
          <ProtectedRoute allowedRoles={["Client"]}>
            <ProgressList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/reports"
        element={
          <ProtectedRoute allowedRoles={["Client"]}>
            <ClientReports authUser={authUser} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Progress Management Routes [[10]] */}
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <ProgressList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress/:id"
        element={
          <ProtectedRoute>
            <ProgressReportDetails authUser={authUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-progress/:projectId"
        element={
          <ProtectedRoute
            allowedRoles={["Admin", "Project Manager", "Site Supervisor"]}
          >
            <CreateProgress />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <h2>Construction MS</h2>
        </div>
        <ul className="nav-links">
          <li className={isActive("/")}>
            <Link to="/">Dashboard</Link>
          </li>
          <li className={isActive("/projects")}>
            <Link to="/projects">Projects</Link>
          </li>
          <li className={isActive("/tasks")}>
            <Link to="/tasks">Tasks</Link>
          </li>
          <li className={isActive("/users")}>
            <Link to="/users">Employees</Link>
          </li>
          <li className={isActive("/clients")}>
            <Link to="/clients">Clients</Link>
          </li>
          <li className={isActive("/equipment")}>
            <Link to="/equipment">Equipment</Link>
          </li>
          <li className={isActive("/materials")}>
            <Link to="/materials">Materials</Link>
          </li>
        </ul>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;

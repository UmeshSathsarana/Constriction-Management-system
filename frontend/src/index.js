import React from "react";
import { createRoot } from "react-dom/client"; // Use createRoot for React 18
import { BrowserRouter } from "react-router-dom";
import "./index.css"; // Import global CSS
import App from "./App";
import axios from "axios";
axios.defaults.baseURL = "http://localhost:5000";

const token = localStorage.getItem("authToken");
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Get the root element
const rootElement = document.getElementById("root");
const root = createRoot(rootElement); // Create a root

// Render the app
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

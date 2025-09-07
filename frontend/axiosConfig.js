import axios from "axios";

// Set base URL without /api prefix
axios.defaults.baseURL = "http://localhost:5000"; // Adjust port to your backend

export default axios;

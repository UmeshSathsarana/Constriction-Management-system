const express = require("express");
const router = express.Router();

// Admin dashboard route
router.get("/dashboard", (req, res) => {
  // In a real application, you'd check if the user is an admin here
  // For now, we'll just render the dashboard
  res.render("admin/dashboard");
});

module.exports = router;

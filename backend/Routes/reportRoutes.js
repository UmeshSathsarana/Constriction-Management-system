const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Create Report
router.post("/", reportController.createReport);

// Get All Reports
router.get("/", reportController.getAllReports);

// Get Report by ID
router.get("/:id", reportController.getReportById);

// Update Report
router.put("/:id", reportController.updateReport);

// Review Report (Approve/Reject)
router.patch("/:id/review", reportController.reviewReport);

// Delete Report
router.delete("/:id", reportController.deleteReport);

// Get Reports by Project
router.get("/project/:projectId", reportController.getReportsByProject);

// Get Reports by User (Submitted by)
router.get("/user/:userId", reportController.getReportsByUser);

// Get Report Statistics
router.get("/stats/dashboard", reportController.getReportStats);

module.exports = router;
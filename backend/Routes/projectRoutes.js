const express = require("express");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  findProjectByName,
  getActiveProjects,
  getProjectsByFinanceManager,
  getProjectsBySiteSupervisor,
  getProjectsByProjectManager,
  assignFinanceManager,
  assignSiteSupervisor,
  assignProjectManager,
  updateProjectStatus,
} = require("../controllers/projectController");

// Import getTasksBySupervisor from taskController
const { getTasksBySupervisor } = require("../controllers/taskController");

const router = express.Router();

// Basic CRUD routes
router.post("/", createProject);
router.get("/", getAllProjects);
router.get("/active", getActiveProjects);
router.get("/search/:name", findProjectByName); // This route must come BEFORE /:id
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Status update route
router.patch("/:id/status", updateProjectStatus);

// Role-specific routes
router.get("/finance-manager/:financeManagerId", getProjectsByFinanceManager);
router.get("/site-supervisor/:siteSupervisorId", getProjectsBySiteSupervisor);
router.get("/project-manager/:projectManagerId", getProjectsByProjectManager);
router.get("/supervisor/:supervisorId/tasks", getTasksBySupervisor);

// Assignment routes
router.patch("/:projectId/assign-finance-manager", assignFinanceManager);
router.patch("/:projectId/assign-site-supervisor", assignSiteSupervisor);
router.patch("/:projectId/assign-project-manager", assignProjectManager);

module.exports = router;
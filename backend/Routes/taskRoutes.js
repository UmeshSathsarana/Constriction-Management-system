const express = require("express");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTasksByProject,
  getTasksByUser,
  updateTaskStatus,
  getTasksBySupervisor,
  assignWorkerToTask,
  getAvailableWorkersForSupervisor,
  removeWorkerFromTask,
} = require("../controllers/taskController");

const router = express.Router();

// Basic CRUD Routes
router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// Specific Routes
router.get("/project/:projectId", getTasksByProject);
router.get("/user/:userId", getTasksByUser);
router.patch("/:id/status", updateTaskStatus);
router.get("/supervisor/:supervisorId", getTasksBySupervisor);

// Site Supervisor Worker Assignment Routes
router.patch("/:taskId/assign-worker", assignWorkerToTask);
router.get("/supervisor/:supervisorId/available-workers", getAvailableWorkersForSupervisor);
router.patch("/:taskId/remove-worker", removeWorkerFromTask);

module.exports = router;

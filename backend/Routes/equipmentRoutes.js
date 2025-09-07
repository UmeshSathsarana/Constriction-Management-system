const express = require("express");
const {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  assignToProject,
  returnFromProject,
  scheduleMaintenance,
  getAvailableEquipment,
  getEquipmentByProject,
  getMaintenanceSchedule,
  getEquipmentStats
} = require("../controllers/equipmentController");

const router = express.Router();

// Basic CRUD routes
router.post("/", createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

// Equipment management routes
router.patch("/:id/assign", assignToProject);
router.patch("/:id/return", returnFromProject);
router.post("/:id/maintenance", scheduleMaintenance);

// Status-specific routes
router.get("/status/available", getAvailableEquipment);
router.get("/project/:projectId", getEquipmentByProject);
router.get("/maintenance/schedule", getMaintenanceSchedule);

// Statistics route
router.get("/stats/dashboard", getEquipmentStats);

module.exports = router;
const Equipment = require("../models/Equipment");

// Create Equipment
exports.createEquipment = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    // Check if request body is an array
    if (Array.isArray(req.body)) {
      // Handle multiple equipment creation
      const equipmentArray = [];
      for (const item of req.body) {
        const newEquipment = new Equipment(item);
        await newEquipment.save();
        equipmentArray.push(newEquipment);
      }

      res.status(201).json({
        message: "Multiple equipment created successfully",
        equipment: equipmentArray,
        count: equipmentArray.length,
      });
    } else {
      // Handle single equipment creation
      const newEquipment = new Equipment(req.body);
      await newEquipment.save();

      console.log("Equipment Created:", newEquipment);

      res.status(201).json({
        message: "Equipment created successfully",
        equipment: newEquipment,
      });
    }
  } catch (err) {
    console.error("Error creating equipment:", err);
    res.status(500).json({
      message: "Error creating equipment",
      error: err.message,
    });
  }
};

// Get All Equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const { status, type, condition, project } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (condition) filter.condition = condition;
    if (project) filter.currentProject = project;

    const equipment = await Equipment.find(filter)
      .populate("currentProject", "name pid")
      .populate("assignedTo", "name email")
      .populate("usageHistory.project", "name pid")
      .populate("usageHistory.assignedTo", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      equipment,
      count: equipment.length 
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching equipment",
      error: err.message,
    });
  }
};

// Get Equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate("currentProject", "name pid location")
      .populate("assignedTo", "name email role")
      .populate("usageHistory.project", "name pid")
      .populate("usageHistory.assignedTo", "name email");

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.status(200).json({ equipment });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching equipment",
      error: err.message,
    });
  }
};

// Update Equipment
exports.updateEquipment = async (req, res) => {
  try {
    const updatedEquipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("currentProject", "name pid")
     .populate("assignedTo", "name email");

    if (!updatedEquipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.status(200).json({
      message: "Equipment updated successfully",
      equipment: updatedEquipment,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating equipment",
      error: err.message,
    });
  }
};

// Delete Equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!deletedEquipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.status(200).json({
      message: "Equipment deleted successfully",
      deletedEquipment: {
        id: deletedEquipment._id,
        name: deletedEquipment.name
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting equipment",
      error: err.message,
    });
  }
};

// Assign Equipment to Project
exports.assignToProject = async (req, res) => {
  try {
    const { projectId, userId, notes } = req.body;
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.status === "In Use") {
      return res.status(400).json({ 
        message: "Equipment is already in use" 
      });
    }

    await equipment.assignToProject(projectId, userId, notes);
    
    // Populate and return updated equipment
    await equipment.populate([
      { path: "currentProject", select: "name pid" },
      { path: "assignedTo", select: "name email" }
    ]);

    res.status(200).json({
      message: "Equipment assigned to project successfully",
      equipment
    });
  } catch (err) {
    res.status(500).json({
      message: "Error assigning equipment",
      error: err.message
    });
  }
};

// Return Equipment from Project
exports.returnFromProject = async (req, res) => {
  try {
    const { hoursUsed, condition, notes } = req.body;
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.status !== "In Use") {
      return res.status(400).json({ 
        message: "Equipment is not currently in use" 
      });
    }

    await equipment.returnFromProject(hoursUsed, condition, notes);

    res.status(200).json({
      message: "Equipment returned successfully",
      equipment
    });
  } catch (err) {
    res.status(500).json({
      message: "Error returning equipment",
      error: err.message
    });
  }
};

// Schedule Maintenance
exports.scheduleMaintenance = async (req, res) => {
  try {
    const { type, description, scheduledDate, cost, performedBy } = req.body;
    
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    await equipment.scheduleMaintenance(type, description, scheduledDate, cost, performedBy);

    res.status(200).json({
      message: "Maintenance scheduled successfully",
      equipment
    });
  } catch (err) {
    res.status(500).json({
      message: "Error scheduling maintenance",
      error: err.message
    });
  }
};

// Get Available Equipment
exports.getAvailableEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ status: "Available" })
      .sort({ name: 1 });

    res.status(200).json({
      equipment,
      count: equipment.length
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching available equipment",
      error: err.message
    });
  }
};

// Get Equipment by Project
exports.getEquipmentByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    
    const equipment = await Equipment.find({ currentProject: projectId })
      .populate("assignedTo", "name email");

    res.status(200).json({
      equipment,
      count: equipment.length
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching project equipment",
      error: err.message
    });
  }
};

// Get Equipment Maintenance Schedule
exports.getMaintenanceSchedule = async (req, res) => {
  try {
    const equipment = await Equipment.find({
      nextMaintenanceDate: { $exists: true, $ne: null }
    }).sort({ nextMaintenanceDate: 1 });

    // Categorize by maintenance status
    const today = new Date();
    const overdue = [];
    const dueSoon = [];
    const scheduled = [];

    equipment.forEach(eq => {
      const daysUntil = Math.ceil((new Date(eq.nextMaintenanceDate) - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        overdue.push(eq);
      } else if (daysUntil <= 7) {
        dueSoon.push(eq);
      } else {
        scheduled.push(eq);
      }
    });

    res.status(200).json({
      overdue,
      dueSoon,
      scheduled,
      total: equipment.length
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching maintenance schedule",
      error: err.message
    });
  }
};

// Get Equipment Statistics
exports.getEquipmentStats = async (req, res) => {
  try {
    const totalEquipment = await Equipment.countDocuments();
    const availableCount = await Equipment.countDocuments({ status: "Available" });
    const inUseCount = await Equipment.countDocuments({ status: "In Use" });
    const maintenanceCount = await Equipment.countDocuments({ status: "Under Maintenance" });
    const outOfServiceCount = await Equipment.countDocuments({ status: "Out of Service" });

    // Get equipment by type
    const equipmentByType = await Equipment.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          available: {
            $sum: { $cond: [{ $eq: ["$status", "Available"] }, 1, 0] }
          },
          inUse: {
            $sum: { $cond: [{ $eq: ["$status", "In Use"] }, 1, 0] }
          }
        }
      }
    ]);

    // Get equipment by condition
    const equipmentByCondition = await Equipment.aggregate([
      {
        $group: {
          _id: "$condition",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      totalEquipment,
      availableCount,
      inUseCount,
      maintenanceCount,
      outOfServiceCount,
      equipmentByType,
      equipmentByCondition
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching equipment statistics",
      error: err.message
    });
  }
};
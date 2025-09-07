// models/Equipment.js
const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "Heavy Machinery",
      "Power Tools",
      "Hand Tools",
      "Safety Equipment",
      "Vehicles",
      "Other",
    ],
  },
  status: {
    type: String,
    enum: ["Available", "In Use", "Under Maintenance", "Out of Service"],
    default: "Available",
  },
  condition: {
    type: String,
    enum: ["Excellent", "Good", "Fair", "Poor", "Needs Repair"],
    default: "Good",
  },
  currentProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  purchaseDate: {
    type: Date,
  },
  purchasePrice: {
    type: Number,
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
  },
  warrantyExpiry: {
    type: Date,
  },
  lastMaintenanceDate: {
    type: Date,
  },
  nextMaintenanceDate: {
    type: Date,
  },
  location: {
    type: String,
    trim: true,
  },
  usageHistory: [
    {
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      hoursUsed: {
        type: Number,
        min: 0,
      },
      condition: {
        type: String,
        enum: ["Excellent", "Good", "Fair", "Poor", "Needs Repair"],
      },
      notes: String,
    },
  ],
  maintenanceHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      type: {
        type: String,
        enum: ["Routine", "Repair", "Inspection", "Upgrade"],
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      cost: {
        type: Number,
        min: 0,
      },
      performedBy: {
        type: String,
        trim: true,
      },
      nextMaintenanceDate: Date,
    },
  ],
  specifications: {
    model: String,
    manufacturer: String,
    serialNumber: String,
    weight: Number,
    dimensions: String,
    powerRating: String,
    fuelType: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate equipment code
equipmentSchema.pre("save", async function (next) {
  if (!this.code) {
    // Get the last equipment code
    const lastEquipment = await mongoose
      .model("Equipment")
      .findOne()
      .sort({ code: -1 })
      .select("code");

    let nextNumber = 1;
    if (lastEquipment && lastEquipment.code) {
      const lastNumber = parseInt(lastEquipment.code.split("-")[1]);
      nextNumber = lastNumber + 1;
    }

    this.code = `EQ-${String(nextNumber).padStart(5, "0")}`;
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Virtual for total usage hours
equipmentSchema.virtual("totalUsageHours").get(function () {
  return this.usageHistory.reduce((total, usage) => total + (usage.hoursUsed || 0), 0);
});

// Virtual for maintenance status
equipmentSchema.virtual("maintenanceStatus").get(function () {
  if (!this.nextMaintenanceDate) return "No Schedule";
  
  const today = new Date();
  const nextMaintenance = new Date(this.nextMaintenanceDate);
  const daysUntilMaintenance = Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilMaintenance < 0) return "Overdue";
  if (daysUntilMaintenance <= 7) return "Due Soon";
  return "Scheduled";
});

// Virtual for warranty status
equipmentSchema.virtual("warrantyStatus").get(function () {
  if (!this.warrantyExpiry) return "No Warranty";
  
  const today = new Date();
  const warrantyExpiry = new Date(this.warrantyExpiry);
  
  if (warrantyExpiry < today) return "Expired";
  
  const daysUntilExpiry = Math.ceil((warrantyExpiry - today) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) return "Expiring Soon";
  
  return "Active";
});

// Method to assign equipment to project
equipmentSchema.methods.assignToProject = function(projectId, userId, notes) {
  this.status = "In Use";
  this.currentProject = projectId;
  this.assignedTo = userId;
  
  // Add to usage history
  this.usageHistory.push({
    project: projectId,
    assignedTo: userId,
    startDate: new Date(),
    notes,
  });
  
  return this.save();
};

// Method to return equipment from project
equipmentSchema.methods.returnFromProject = function(hoursUsed, condition, notes) {
  this.status = "Available";
  this.currentProject = null;
  this.assignedTo = null;
  this.condition = condition || this.condition;
  
  // Update the latest usage history entry
  const latestUsage = this.usageHistory[this.usageHistory.length - 1];
  if (latestUsage && !latestUsage.endDate) {
    latestUsage.endDate = new Date();
    latestUsage.hoursUsed = hoursUsed;
    latestUsage.condition = condition;
    latestUsage.notes = notes;
  }
  
  return this.save();
};

// Method to schedule maintenance
equipmentSchema.methods.scheduleMaintenance = function(type, description, scheduledDate, cost, performedBy) {
  this.maintenanceHistory.push({
    type,
    description,
    cost,
    performedBy,
    nextMaintenanceDate: scheduledDate,
  });
  
  this.lastMaintenanceDate = new Date();
  this.nextMaintenanceDate = scheduledDate;
  
  return this.save();
};

// Ensure virtuals are included in JSON output
equipmentSchema.set("toJSON", { virtuals: true });
equipmentSchema.set("toObject", { virtuals: true });

// Index for better query performance
equipmentSchema.index({ code: 1 });
equipmentSchema.index({ type: 1 });
equipmentSchema.index({ status: 1 });
equipmentSchema.index({ currentProject: 1 });

module.exports = mongoose.model("Equipment", equipmentSchema);
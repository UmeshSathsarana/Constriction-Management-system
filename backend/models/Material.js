// models/Material.js
const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
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
    enum: ["Cement", "Steel", "Bricks", "Sand", "Wood", "Paint", "Other"],
  },
  unit: {
    type: String,
    required: true,
    enum: ["kg", "tons", "pieces", "cubic meters", "bags", "liters"],
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  maxStockLevel: {
    type: Number,
    default: 1000,
    min: 0,
  },
  supplier: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  color: { 
    type: String 
  },
  status: {
    type: String,
    enum: ["Available", "Low Stock", "Out of Stock", "Discontinued"],
    default: "Available",
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  stockHistory: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      action: {
        type: String,
        enum: ["Added", "Used", "Adjusted", "Returned"],
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      previousStock: {
        type: Number,
        required: true,
      },
      newStock: {
        type: Number,
        required: true,
      },
      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate material code
materialSchema.pre("save", async function (next) {
  if (!this.code) {
    const count = await mongoose.model("Material").countDocuments();
    this.code = `MAT-${String(count + 1).padStart(5, "0")}`;
  }
  
  // Update status based on quantity
  if (this.quantity <= 0) {
    this.status = "Out of Stock";
  } else if (this.quantity <= this.minStockLevel) {
    this.status = "Low Stock";
  } else {
    this.status = "Available";
  }
  
  this.lastUpdated = Date.now();
  next();
});

// Virtual for total value
materialSchema.virtual("totalValue").get(function () {
  return this.quantity * this.unitPrice;
});

// Virtual for stock status
materialSchema.virtual("stockStatus").get(function () {
  if (this.quantity <= 0) return "Out of Stock";
  if (this.quantity <= this.minStockLevel) return "Low Stock";
  if (this.quantity >= this.maxStockLevel) return "Overstock";
  return "Normal";
});

// Method to update stock
materialSchema.methods.updateStock = function(action, quantity, project, updatedBy, notes) {
  const previousStock = this.quantity;
  
  switch (action) {
    case "Added":
      this.quantity += quantity;
      break;
    case "Used":
      this.quantity = Math.max(0, this.quantity - quantity);
      break;
    case "Adjusted":
      this.quantity = quantity;
      break;
    case "Returned":
      this.quantity += quantity;
      break;
  }
  
  // Add to stock history
  this.stockHistory.push({
    action,
    quantity,
    previousStock,
    newStock: this.quantity,
    project,
    updatedBy,
    notes,
  });
  
  return this.save();
};

// Ensure virtuals are included in JSON output
materialSchema.set("toJSON", { virtuals: true });
materialSchema.set("toObject", { virtuals: true });

// Index for better query performance
materialSchema.index({ code: 1 });
materialSchema.index({ type: 1 });
materialSchema.index({ status: 1 });
materialSchema.index({ quantity: 1 });

module.exports = mongoose.model("Material", materialSchema);
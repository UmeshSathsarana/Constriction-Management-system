const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Project is required"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: {
      values: ["Pending", "In Progress", "Completed", "Cancelled"],
      message:
        "Status must be one of: Pending, In Progress, Completed, Cancelled",
    },
    default: "Pending",
  },
  priority: {
    type: String,
    enum: {
      values: ["Low", "Medium", "High", "Critical"],
      message: "Priority must be one of: Low, Medium, High, Critical",
    },
    default: "Medium",
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"],
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: "Due date must be after start date",
    },
  },
  completedDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || this.status === "Completed";
      },
      message: "Completion date can only be set when status is Completed",
    },
  },
  estimatedHours: {
    type: Number,
    min: [0, "Estimated hours cannot be negative"],
  },
  actualHours: {
    type: Number,
    min: [0, "Actual hours cannot be negative"],
  },
  notes: [
    {
      content: String,
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  materials: [
    {
      material: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true,
      },
      quantity: { type: Number, required: true, min: 0 },
    },
  ],
  equipment:[
    {
      equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "equipment",
    required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    }
  ]
  
});

// Middleware to update updatedAt on save
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if task is overdue
taskSchema.virtual("isOverdue").get(function () {
  return (
    this.status !== "Completed" &&
    this.status !== "Cancelled" &&
    new Date(this.dueDate) < new Date()
  );
});

// Virtual for days until due date
taskSchema.virtual("daysUntilDue").get(function () {
  if (this.status === "Completed" || this.status === "Cancelled") {
    return null;
  }
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

// Index for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ priority: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);

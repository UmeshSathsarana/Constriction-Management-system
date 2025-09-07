const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  siteSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  pid: {
    type: String,
    required: [true, "Project id is required"],
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: [true, "Project location is required"],
    trim: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client", // Make this optional for now
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Make this optional for now
  },
  financeManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: "End date must be after start date",
    },
  },
  budget: {
    type: Number,
    required: [true, "Budget is required"],
    min: [0, "Budget cannot be negative"],
  },
  agreement: {
    type: String,
    trim: true,
  },
  projectPlan: {
    type: String,
    trim: true,
  },
  certificateCode: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Planning", "Active", "In Progress", "Completed", "Cancelled"],
    default: "Planning",
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp on save
projectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for project duration in days
projectSchema.virtual("durationDays").get(function () {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate - this.startDate;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Ensure virtuals are included in JSON output
projectSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Project", projectSchema);

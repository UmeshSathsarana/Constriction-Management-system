const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Project is required"],
  },
  reportType: {
    type: String,
    enum: ["Daily", "Weekly", "Monthly", "Progress", "Financial", "Material", "Equipment"],
    required: [true, "Report type is required"],
  },
  title: {
    type: String,
    required: [true, "Report title is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Report description is required"],
  },
  reportDate: {
    type: Date,
    required: [true, "Report date is required"],
    default: Date.now,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Submitted by is required"],
  },
  status: {
    type: String,
    enum: ["Draft", "Submitted", "Under Review", "Approved", "Rejected"],
    default: "Submitted",
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewDate: {
    type: Date,
  },
  reviewComments: {
    type: String,
  },
  attachments: [
    {
      filename: String,
      url: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  images: [
    {
      type: String, // Base64 encoded images or URLs
    },
  ],
  data: {
    // Flexible field for different report types
    workCompleted: String,
    materialsUsed: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
        },
        quantity: Number,
        cost: Number,
      },
    ],
    equipmentUsed: [
      {
        equipment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Equipment",
        },
        hoursUsed: Number,
        condition: String,
      },
    ],
    laborHours: Number,
    expenses: [
      {
        category: String,
        amount: Number,
        description: String,
      },
    ],
    issues: [
      {
        description: String,
        severity: {
          type: String,
          enum: ["Low", "Medium", "High", "Critical"],
          default: "Medium",
        },
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    recommendations: String,
    nextDayPlan: String,
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
reportSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
reportSchema.index({ project: 1, reportType: 1 });
reportSchema.index({ submittedBy: 1, status: 1 });
reportSchema.index({ reportDate: -1 });

module.exports = mongoose.model("Report", reportSchema);
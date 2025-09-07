// models/Progress.js
const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Project is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now,
  },
  workCompleted: {
    type: String,
    required: [true, "Work completed description is required"],
  },
  percentageComplete: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  images: [
    {
      type: String, // Base64 encoded images
    },
  ],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Draft", "Submitted", "Approved"],
    default: "Submitted",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Progress", progressSchema);

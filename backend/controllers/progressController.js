// controllers/progressController.js
const Progress = require("../models/Progress");
const Project = require("../models/Project");
const User = require("../models/User");

exports.createProgress = async (req, res) => {
  try {
    const newProgress = new Progress(req.body);
    await newProgress.save();
    await newProgress.populate([
      { path: "project", select: "name location projectManager siteSupervisor financeManager" },
      { path: "reportedBy", select: "name role" },
    ]);

    // Get Socket.IO instance
    const io = req.app.get('io');
    
    // Emit real-time update to all connected users
    io.emit('progress-update', {
      type: 'new-progress',
      progress: newProgress,
      message: `New progress report submitted for ${newProgress.project?.name}`
    });

    // Emit to specific roles
    io.to('Admin').emit('new-progress-report', newProgress);
    io.to('Project Manager').emit('new-progress-report', newProgress);
    io.to('Site Supervisor').emit('progress-update', newProgress);

    // Emit to project-specific room
    if (newProgress.project) {
      io.to(`project-${newProgress.project._id}`).emit('project-progress-update', newProgress);
    }

    res.status(201).json({
      message: "Progress report created successfully",
      progress: newProgress,
    });
  } catch (err) {
    console.error("Error creating progress report:", err);
    res.status(500).json({
      message: "Error creating progress report",
      error: err.message,
    });
  }
};

exports.getProgressByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const progressReports = await Progress.find({ project: projectId })
      .populate("reportedBy", "name role")
      .populate("project", "name location")
      .sort({ date: -1 });

    res.status(200).json({
      progressReports,
      count: progressReports.length,
    });
  } catch (err) {
    console.error("Error fetching progress reports:", err);
    res.status(500).json({
      message: "Error fetching progress reports",
      error: err.message,
    });
  }
};

exports.getLatestProgress = async (req, res) => {
  try {
    const latestProgress = await Progress.find()
      .populate("project", "name location status")
      .populate("reportedBy", "name role")
      .sort({ date: -1 })
      .limit(10);

    res.status(200).json({
      latestProgress,
      count: latestProgress.length,
    });
  } catch (err) {
    console.error("Error fetching latest progress:", err);
    res.status(500).json({
      message: "Error fetching latest progress",
      error: err.message,
    });
  }
};

exports.getAllProgress = async (req, res) => {
  try {
    const { status, project, reportedBy } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (project) filter.project = project;
    if (reportedBy) filter.reportedBy = reportedBy;

    const progressReports = await Progress.find(filter)
      .populate("project", "name location status")
      .populate("reportedBy", "name role email")
      .sort({ date: -1 });

    res.status(200).json({
      progressReports,
      count: progressReports.length,
    });
  } catch (err) {
    console.error("Error fetching progress reports:", err);
    res.status(500).json({
      message: "Error fetching progress reports",
      error: err.message,
    });
  }
};

exports.getProgressById = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await Progress.findById(id)
      .populate("project", "name location status client projectManager")
      .populate("reportedBy", "name role email");

    if (!progress) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    res.status(200).json({ progress });
  } catch (err) {
    console.error("Error fetching progress report:", err);
    res.status(500).json({
      message: "Error fetching progress report",
      error: err.message,
    });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProgress = await Progress.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "project", select: "name location" },
      { path: "reportedBy", select: "name role" },
    ]);

    if (!updatedProgress) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('progress-updated', {
      type: 'progress-updated',
      progress: updatedProgress
    });

    res.status(200).json({
      message: "Progress report updated successfully",
      progress: updatedProgress,
    });
  } catch (err) {
    console.error("Error updating progress report:", err);
    res.status(500).json({
      message: "Error updating progress report",
      error: err.message,
    });
  }
};

exports.approveProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;

    const updatedProgress = await Progress.findByIdAndUpdate(
      id,
      { status, approvedBy },
      { new: true }
    ).populate([
      { path: "project", select: "name location" },
      { path: "reportedBy", select: "name role" },
    ]);

    if (!updatedProgress) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('progress-approved', {
      type: 'progress-approved',
      progress: updatedProgress,
      status
    });

    res.status(200).json({
      message: "Progress report approved successfully",
      progress: updatedProgress,
    });
  } catch (err) {
    console.error("Error approving progress report:", err);
    res.status(500).json({
      message: "Error approving progress report",
      error: err.message,
    });
  }
};

exports.deleteProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProgress = await Progress.findByIdAndDelete(id);

    if (!deletedProgress) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('progress-deleted', {
      type: 'progress-deleted',
      progressId: id
    });

    res.status(200).json({
      message: "Progress report deleted successfully",
      deletedProgress: {
        id: deletedProgress._id,
        project: deletedProgress.project
      }
    });
  } catch (err) {
    console.error("Error deleting progress report:", err);
    res.status(500).json({
      message: "Error deleting progress report",
      error: err.message,
    });
  }
};
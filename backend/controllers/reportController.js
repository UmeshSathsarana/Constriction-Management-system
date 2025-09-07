const Report = require("../models/Report");
const Project = require("../models/Project");
const User = require("../models/User");

// Create Report
exports.createReport = async (req, res) => {
  try {
    // Validate project exists
    const projectExists = await Project.findById(req.body.project);
    if (!projectExists) {
      return res.status(400).json({
        message: "Project not found. Please provide a valid project ID.",
      });
    }

    // Validate user exists
    const userExists = await User.findById(req.body.submittedBy);
    if (!userExists) {
      return res.status(400).json({
        message: "User not found. Please provide a valid user ID.",
      });
    }

    const newReport = new Report(req.body);
    await newReport.save();

    // Populate references
    await newReport.populate([
      { path: "project", select: "name pid location" },
      { path: "submittedBy", select: "name email role" },
      { path: "reviewedBy", select: "name email role" },
    ]);

    res.status(201).json({
      message: "Report created successfully",
      report: newReport,
    });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({
      message: "Error creating report",
      error: err.message,
    });
  }
};

// Get All Reports
exports.getAllReports = async (req, res) => {
  try {
    const { project, reportType, status, submittedBy } = req.query;
    
    // Build filter object
    const filter = {};
    if (project) filter.project = project;
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;
    if (submittedBy) filter.submittedBy = submittedBy;

    const reports = await Report.find(filter)
      .populate("project", "name pid location")
      .populate("submittedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ reportDate: -1 });

    res.status(200).json({
      reports,
      count: reports.length,
    });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({
      message: "Error fetching reports",
      error: err.message,
    });
  }
};

// Get Report by ID
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("project", "name pid location client")
      .populate("submittedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .populate("data.materialsUsed.material", "name unit")
      .populate("data.equipmentUsed.equipment", "name type");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ report });
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({
      message: "Error fetching report",
      error: err.message,
    });
  }
};

// Update Report
exports.updateReport = async (req, res) => {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate([
      { path: "project", select: "name pid location" },
      { path: "submittedBy", select: "name email role" },
      { path: "reviewedBy", select: "name email role" },
    ]);

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).json({
      message: "Error updating report",
      error: err.message,
    });
  }
};

// Review Report (Approve/Reject)
exports.reviewReport = async (req, res) => {
  try {
    const { status, reviewComments, reviewedBy } = req.body;

    if (!["Approved", "Rejected", "Under Review"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Approved, Rejected, or Under Review",
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewComments,
        reviewedBy,
        reviewDate: Date.now(),
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "project", select: "name pid location" },
      { path: "submittedBy", select: "name email role" },
      { path: "reviewedBy", select: "name email role" },
    ]);

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      message: `Report ${status.toLowerCase()} successfully`,
      report: updatedReport,
    });
  } catch (err) {
    console.error("Error reviewing report:", err);
    res.status(500).json({
      message: "Error reviewing report",
      error: err.message,
    });
  }
};

// Get Reports by Project
exports.getReportsByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { reportType, status } = req.query;

    const filter = { project: projectId };
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate("submittedBy", "name email role")
      .populate("reviewedBy", "name email role")
      .sort({ reportDate: -1 });

    res.status(200).json({
      reports,
      count: reports.length,
    });
  } catch (err) {
    console.error("Error fetching project reports:", err);
    res.status(500).json({
      message: "Error fetching project reports",
      error: err.message,
    });
  }
};

// Get Reports by User (Submitted by)
exports.getReportsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { reportType, status } = req.query;

    const filter = { submittedBy: userId };
    if (reportType) filter.reportType = reportType;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate("project", "name pid location")
      .populate("reviewedBy", "name email role")
      .sort({ reportDate: -1 });

    res.status(200).json({
      reports,
      count: reports.length,
    });
  } catch (err) {
    console.error("Error fetching user reports:", err);
    res.status(500).json({
      message: "Error fetching user reports",
      error: err.message,
    });
  }
};

// Delete Report
exports.deleteReport = async (req, res) => {
  try {
    const deletedReport = await Report.findByIdAndDelete(req.params.id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      message: "Report deleted successfully",
      deletedReport: {
        id: deletedReport._id,
        title: deletedReport.title,
      },
    });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({
      message: "Error deleting report",
      error: err.message,
    });
  }
};

// Get Dashboard Statistics for Reports
exports.getReportStats = async (req, res) => {
  try {
    const { project, userId } = req.query;
    
    const filter = {};
    if (project) filter.project = project;
    if (userId) filter.submittedBy = userId;

    const stats = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const typeStats = await Report.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$reportType",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalReports = await Report.countDocuments(filter);

    res.status(200).json({
      totalReports,
      statusStats: stats,
      typeStats: typeStats,
    });
  } catch (err) {
    console.error("Error fetching report stats:", err);
    res.status(500).json({
      message: "Error fetching report stats",
      error: err.message,
    });
  }
};
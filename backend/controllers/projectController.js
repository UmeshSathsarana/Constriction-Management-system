const Project = require("../models/Project");
const Client = require("../models/Client"); // Import Client model
const User = require("../models/User"); // Import User model

// Create Project
exports.createProject = async (req, res) => {
  try {
    // Validate client exists if provided
    if (req.body.client) {
      const clientExists = await Client.findById(req.body.client);
      if (!clientExists) {
        return res.status(400).json({
          message:
            "Client not found. Please provide a valid client ID or leave empty.",
        });
      }
    }

    // Validate project manager exists if provided
    if (req.body.projectManager) {
      const managerExists = await User.findById(req.body.projectManager);
      if (!managerExists) {
        return res.status(400).json({
          message:
            "Project manager not found. Please provide a valid user ID or leave empty.",
        });
      }
    }

    // Validate finance manager exists if provided
    if (req.body.financeManager) {
      const financeManagerExists = await User.findById(req.body.financeManager);
      if (!financeManagerExists) {
        return res.status(400).json({
          message:
            "Finance manager not found. Please provide a valid user ID or leave empty.",
        });
      }
    }

    // Validate site supervisor exists if provided
    if (req.body.siteSupervisor) {
      const siteSupervisorExists = await User.findById(req.body.siteSupervisor);
      if (!siteSupervisorExists) {
        return res.status(400).json({
          message:
            "Site supervisor not found. Please provide a valid user ID or leave empty.",
        });
      }
    }

    const newProject = new Project(req.body);
    await newProject.save();

    // Populate references only if they exist
    await newProject.populate([
      { path: "client", select: "name company email" },
      { path: "projectManager", select: "name email role" },
      { path: "financeManager", select: "name email role" },
      { path: "siteSupervisor", select: "name email role" },
    ]);

    res.status(201).json({
      message: "Project created successfully",
      project: newProject,
    });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({
      message: "Error creating project",
      error: err.message,
    });
  }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    // Use populate conditionally to avoid errors
    const projects = await Project.find()
      .populate({
        path: "client",
        select: "name company email",
        options: { strictPopulate: false },
      })
      .populate({
        path: "projectManager",
        select: "name email role",
        options: { strictPopulate: false },
      })
      .populate({
        path: "financeManager",
        select: "name email role",
        options: { strictPopulate: false },
      })
      .populate({
        path: "siteSupervisor",
        select: "name email role",
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
      count: projects.length,
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({
      message: "Error fetching projects",
      error: err.message,
    });
  }
};

// Search Project by Name
exports.findProjectByName = async (req, res) => {
  try {
    const name = req.params.name;
    const projects = await Project.find({
      name: { $regex: name, $options: "i" }, // case-insensitive search
    })
      .populate({
        path: "client",
        select: "name company email",
        options: { strictPopulate: false },
      })
      .populate({
        path: "projectManager",
        select: "name email role",
        options: { strictPopulate: false },
      });

    if (projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found with that name" });
    }

    res.status(200).json({ projects });
  } catch (err) {
    console.error("Error searching project:", err);
    res.status(500).json({
      message: "Error searching project",
      error: err.message,
    });
  }
};

// Get Project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: "client",
        select: "name company email phone address",
        options: { strictPopulate: false },
      })
      .populate({
        path: "projectManager",
        select: "name email role",
        options: { strictPopulate: false },
      });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (err) {
    console.error("Error fetching project:", err);
    res.status(500).json({
      message: "Error fetching project",
      error: err.message,
    });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if certificate code is required for updates
    const existingProject = await Project.findById(id);
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // If certificate code is set on the project, require it for updates
    if (existingProject.certificateCode && existingProject.certificateCode.trim()) {
      if (!updateData.certificateCode || updateData.certificateCode !== existingProject.certificateCode) {
        return res.status(403).json({
          message: "Certificate code is required to update this project"
        });
      }
    }

    // Remove certificate code from update data to prevent accidental changes
    delete updateData.certificateCode;

    // Validate client exists if being updated
    if (updateData.client) {
      const clientExists = await Client.findById(updateData.client);
      if (!clientExists) {
        return res.status(400).json({
          message: "Client not found. Please provide a valid client ID.",
        });
      }
    }

    // Validate project manager exists if being updated
    if (updateData.projectManager) {
      const managerExists = await User.findById(updateData.projectManager);
      if (!managerExists) {
        return res.status(400).json({
          message: "Project manager not found. Please provide a valid user ID.",
        });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate([
      { path: "client", select: "name company email phone address contactPerson" },
      { path: "projectManager", select: "name email role" },
      { path: "financeManager", select: "name email role" },
      { path: "siteSupervisor", select: "name email role" },
    ]);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({
      message: "Error updating project",
      error: err.message,
    });
  }
};

// Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project deleted successfully",
      deletedProject: {
        id: deletedProject._id,
        name: deletedProject.name,
      },
    });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({
      message: "Error deleting project",
      error: err.message,
    });
  }
};

// Get Active Projects
exports.getActiveProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      status: { $in: ["Active", "In Progress"] },
    })
      .populate("client", "name")
      .populate("siteSupervisor", "name");

    res.status(200).json({ projects });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching active projects",
      error: err.message,
    });
  }
};

// Get Projects by Finance Manager
exports.getProjectsByFinanceManager = async (req, res) => {
  try {
    const financeManagerId = req.params.financeManagerId;
    const projects = await Project.find({ financeManager: financeManagerId })
      .populate("client", "name company email")
      .populate("projectManager", "name email role")
      .populate("siteSupervisor", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
      count: projects.length,
    });
  } catch (err) {
    console.error("Error fetching finance manager projects:", err);
    res.status(500).json({
      message: "Error fetching finance manager projects",
      error: err.message,
    });
  }
};

// Get Projects by Site Supervisor
exports.getProjectsBySiteSupervisor = async (req, res) => {
  try {
    const siteSupervisorId = req.params.siteSupervisorId;
    const projects = await Project.find({ siteSupervisor: siteSupervisorId })
      .populate("client", "name company email")
      .populate("projectManager", "name email role")
      .populate("financeManager", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
      count: projects.length,
    });
  } catch (err) {
    console.error("Error fetching site supervisor projects:", err);
    res.status(500).json({
      message: "Error fetching site supervisor projects",
      error: err.message,
    });
  }
};

// Get Projects by Project Manager
exports.getProjectsByProjectManager = async (req, res) => {
  try {
    const projectManagerId = req.params.projectManagerId;
    const projects = await Project.find({ projectManager: projectManagerId })
      .populate("client", "name company email")
      .populate("financeManager", "name email role")
      .populate("siteSupervisor", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      projects,
      count: projects.length,
    });
  } catch (err) {
    console.error("Error fetching project manager projects:", err);
    res.status(500).json({
      message: "Error fetching project manager projects",
      error: err.message,
    });
  }
};

// Assign Finance Manager to Project
exports.assignFinanceManager = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { financeManagerId } = req.body;

    // Validate finance manager exists
    const financeManager = await User.findById(financeManagerId);
    if (!financeManager || financeManager.role !== "Financial Manager") {
      return res.status(400).json({
        message: "Invalid finance manager. User must have Financial Manager role.",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { financeManager: financeManagerId, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate([
      { path: "client", select: "name company email" },
      { path: "projectManager", select: "name email role" },
      { path: "financeManager", select: "name email role" },
      { path: "siteSupervisor", select: "name email role" },
    ]);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Finance manager assigned successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error assigning finance manager:", err);
    res.status(500).json({
      message: "Error assigning finance manager",
      error: err.message,
    });
  }
};

// Assign Site Supervisor to Project
exports.assignSiteSupervisor = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { siteSupervisorId } = req.body;

    // Validate site supervisor exists
    const siteSupervisor = await User.findById(siteSupervisorId);
    if (!siteSupervisor || siteSupervisor.role !== "Site Supervisor") {
      return res.status(400).json({
        message: "Invalid site supervisor. User must have Site Supervisor role.",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { siteSupervisor: siteSupervisorId, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate([
      { path: "client", select: "name company email" },
      { path: "projectManager", select: "name email role" },
      { path: "financeManager", select: "name email role" },
      { path: "siteSupervisor", select: "name email role" },
    ]);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Site supervisor assigned successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error assigning site supervisor:", err);
    res.status(500).json({
      message: "Error assigning site supervisor",
      error: err.message,
    });
  }
};

// Update Project Status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Planning", "Active", "In Progress", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate([
      { path: "client", select: "name company email" },
      { path: "projectManager", select: "name email role" },
      { path: "financeManager", select: "name email role" },
      { path: "siteSupervisor", select: "name email role" },
    ]);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project status updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error updating project status:", err);
    res.status(500).json({
      message: "Error updating project status",
      error: err.message,
    });
  }
};

// Assign Project Manager to Project
exports.assignProjectManager = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { projectManagerId } = req.body;

    // Validate project manager exists
    const projectManager = await User.findById(projectManagerId);
    if (!projectManager || projectManager.role !== "Project Manager") {
      return res.status(400).json({
        message: "Invalid project manager. User must have Project Manager role.",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { projectManager: projectManagerId, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate([
      { path: "client", select: "name company email" },
      { path: "projectManager", select: "name email role" },
      { path: "financeManager", select: "name email role" },
      { path: "siteSupervisor", select: "name email role" },
    ]);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project manager assigned successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("Error assigning project manager:", err);
    res.status(500).json({
      message: "Error assigning project manager",
      error: err.message,
    });
  }
};

// Auto-update Project Status based on Task Completion
exports.autoUpdateProjectStatus = async (projectId) => {
  try {
    const Task = require("../models/Task");

    // Get all tasks for the project
    const tasks = await Task.find({ project: projectId });
    const totalTasks = tasks.length;

    if (totalTasks === 0) {
      // No tasks yet, keep current status
      return;
    }

    const completedTasks = tasks.filter(task => task.status === "Completed").length;
    const inProgressTasks = tasks.filter(task => task.status === "In Progress").length;
    const completionPercentage = (completedTasks / totalTasks) * 100;

    let newStatus = "Planning"; // Default

    if (completionPercentage === 100) {
      newStatus = "Completed";
    } else if (completedTasks > 0 || inProgressTasks > 0) {
      newStatus = "In Progress";
    } else if (totalTasks > 0) {
      newStatus = "Active";
    }

    // Update project status and progress
    await Project.findByIdAndUpdate(
      projectId,
      {
        status: newStatus,
        progress: Math.round(completionPercentage),
        updatedAt: Date.now()
      },
      { new: true }
    );

    console.log(`Project ${projectId} status auto-updated to ${newStatus} (${Math.round(completionPercentage)}% complete)`);

  } catch (err) {
    console.error("Error auto-updating project status:", err);
  }
};

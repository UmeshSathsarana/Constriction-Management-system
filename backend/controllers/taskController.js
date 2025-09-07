const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const mongoose = require("mongoose");
const Material = require("../models/Material");
const Equipment = require("../models/Equipment");

exports.createTask = async (req, res) => {
  const {
    title,
    description,
    project,
    assignedTo,
    priority,
    startDate,
    dueDate,
    materials,
    equipment,
  } = req.body;

  try {
    if (!project || !mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        message: "Invalid or missing project ID. Please provide a valid ObjectId.",
      });
    }

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({
        message: "Project not found. Please provide a valid project ID.",
      });
    }

    if (assignedTo && !mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        message: "Invalid user ID format.",
      });
    }

    let materialsList = [];
    if (materials && Array.isArray(materials)) {
      for (const item of materials) {
        if (!item.material || !mongoose.Types.ObjectId.isValid(item.material)) {
          return res.status(400).json({
            message: "Invalid material ID format in materials array.",
          });
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 0) {
          return res.status(400).json({
            message: "Invalid or missing quantity for material.",
          });
        }

        const materialExists = await Material.findById(item.material);

        if (!materialExists) {
          return res.status(404).json({
            message: `Material with ID ${item.material} not found.`,
          });
        }

        if (materialExists.quantity < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for material ${item.material}. Requested: ${item.quantity}, Available: ${materialExists.quantity}.`,
          });
        }

        materialsList.push({
          material: item.material,
          quantity: item.quantity,
        });
      }
    }

    let equipmentList =[];
    
    if (equipment && Array.isArray(equipment) && equipment.length > 0) {
      // Since schema expects a single ObjectId, take the first equipment's ID
      const equipmentItem = equipment[0];
      if (!equipmentItem.equipment || !mongoose.Types.ObjectId.isValid(equipmentItem.equipment)) {
        return res.status(400).json({
          message: "Invalid equipment ID format.",
        });
      }

      // Verify equipment exists (assuming Equipment model exists)
      const equipmentExists = await Equipment.findById(equipmentItem.equipment);
      if (!equipmentExists) {
        return res.status(404).json({
          message: `Equipment with ID ${equipmentItem.equipment} not found.`,
        });
      }
      
      equipmentList.push({
        equipment: equipmentItem.equipment,
        quantity: equipmentItem.quantity,
      })

    } else {
      return res.status(400).json({
        message: "Equipment array is required with at least one valid equipment ID.",
      });
    }
    
    const newTask = new Task({
      title,
      description,
      project,
      assignedTo,
      priority: priority || "Medium",
      startDate,
      dueDate,
      materials: materialsList,
      equipment: equipmentList,
      status: "Pending",
    });

    
    if (materialsList.length > 0) {
      for (const item of materialsList) {
        const material = await Material.findById(item.material);
        await material.updateStock(
          "Used",
          item.quantity,
          project,
          req.user?._id || null, 
          `Used for task: ${title}`
        );
      }
    }

    await newTask.save();
    await newTask.populate(["project", "assignedTo", "materials.material", "equipment"]);


    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({
      message: "Error creating task",
      error: err.message,
    });
  }
};

// Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      project,
      assignedTo,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;

    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate("project", "name location status")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalTasks = await Task.countDocuments(filter);

    res.status(200).json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name location status budget")
      .populate("assignedTo", "name email role");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching task" });
  }
};

// Update Task
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(["project", "assignedTo"]);

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error updating task",
      error: err.message,
    });
  }
};

// Delete Task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      deletedTask: {
        id: deletedTask._id,
        title: deletedTask.title,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting task" });
  }
};

// Get Tasks by Project
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email role")
      .sort({ priority: 1, dueDate: 1 });

    res.status(200).json({
      project: {
        id: project._id,
        name: project.name,
        location: project.location,
      },
      tasks,
      count: tasks.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching project tasks" });
  }
};

// Get Tasks by User
exports.getTasksByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tasks = await Task.find({ assignedTo: userId })
      .populate("project", "name location status")
      .sort({ dueDate: 1 });

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      tasks,
      totalTasks: tasks.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user tasks" });
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    const updateData = { status };
    if (status === "Completed") {
      updateData.completedDate = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate(["project", "assignedTo"]);

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Auto-update project status after task status change
    const { autoUpdateProjectStatus } = require("../controllers/projectController");
    await autoUpdateProjectStatus(updatedTask.project._id);

    res.status(200).json({
      message: `Task status updated to ${status}`,
      task: updatedTask,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task status" });
  }
}; // Closing brace for updateTaskStatus

// Get Tasks by Supervisor
exports.getTasksBySupervisor = async (req, res) => {
  try {
    const supervisorId = req.params.supervisorId;

    // Get projects where supervisor is assigned as siteSupervisor
    const projects = await Project.find({
      siteSupervisor: supervisorId,
    });
    const projectIds = projects.map((p) => p._id);

    // Find tasks that are either:
    // 1. In projects where supervisor is the siteSupervisor, OR
    // 2. Directly assigned to the supervisor
    const tasks = await Task.find({
      $or: [
        { project: { $in: projectIds } }, // Tasks from supervised projects
        { assignedTo: supervisorId }     // Tasks directly assigned to supervisor
      ]
    })
      .populate("project", "name location status")
      .populate("assignedTo", "name email role phone")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching supervisor tasks",
      error: err.message,
    });
  }
};

// Assign Worker to Task (Site Supervisor Only)
exports.assignWorkerToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { workerId, supervisorId } = req.body;

    // Validate task exists
    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate worker exists and has Worker role
    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    if (worker.role !== "Worker") {
      return res.status(400).json({
        message: "User must have Worker role to be assigned to tasks"
      });
    }

    // Validate supervisor exists and has Site Supervisor role
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
    if (supervisor.role !== "Site Supervisor") {
      return res.status(403).json({
        message: "Only Site Supervisors can assign workers to tasks"
      });
    }

    // Check if supervisor is assigned to the project
    const project = await Project.findById(task.project._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.siteSupervisor.toString() !== supervisorId) {
      return res.status(403).json({
        message: "You can only assign workers to tasks in your supervised projects"
      });
    }

    // Update task with new worker assignment
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        assignedTo: workerId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "project", select: "name location status" },
      { path: "assignedTo", select: "name email role" }
    ]);

    res.status(200).json({
      message: "Worker assigned to task successfully",
      task: updatedTask
    });

  } catch (err) {
    console.error("Error assigning worker to task:", err);
    res.status(500).json({
      message: "Error assigning worker to task",
      error: err.message
    });
  }
};

// Get Available Workers for Supervisor's Projects
exports.getAvailableWorkersForSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.params;

    // Validate supervisor exists and has correct role
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
    if (supervisor.role !== "Site Supervisor") {
      return res.status(403).json({
        message: "Only Site Supervisors can view available workers"
      });
    }

    // Get all projects supervised by this supervisor
    const projects = await Project.find({ siteSupervisor: supervisorId });
    const projectIds = projects.map(p => p._id);

    // Get all tasks in supervisor's projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate("assignedTo", "name email")
      .select("assignedTo");

    // Get IDs of workers already assigned to tasks
    const assignedWorkerIds = tasks
      .filter(task => task.assignedTo)
      .map(task => task.assignedTo._id.toString());

    // Get all workers not already assigned to supervisor's projects
    const availableWorkers = await User.find({
      role: "Worker",
      _id: { $nin: assignedWorkerIds }
    }).select("name email phone");

    res.status(200).json({
      supervisor: {
        id: supervisor._id,
        name: supervisor.name
      },
      availableWorkers,
      totalAvailable: availableWorkers.length
    });

  } catch (err) {
    console.error("Error fetching available workers:", err);
    res.status(500).json({
      message: "Error fetching available workers",
      error: err.message
    });
  }
};

// Remove Worker from Task (Site Supervisor Only)
exports.removeWorkerFromTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { supervisorId } = req.body;

    // Validate task exists
    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Validate supervisor exists and has Site Supervisor role
    const supervisor = await User.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
    if (supervisor.role !== "Site Supervisor") {
      return res.status(403).json({
        message: "Only Site Supervisors can remove workers from tasks"
      });
    }

    // Check if supervisor is assigned to the project
    const project = await Project.findById(task.project._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (project.siteSupervisor.toString() !== supervisorId) {
      return res.status(403).json({
        message: "You can only manage workers in your supervised projects"
      });
    }

    // Remove worker assignment
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        assignedTo: null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate([
      { path: "project", select: "name location status" },
      { path: "assignedTo", select: "name email role" }
    ]);

    res.status(200).json({
      message: "Worker removed from task successfully",
      task: updatedTask
    });

  } catch (err) {
    console.error("Error removing worker from task:", err);
    res.status(500).json({
      message: "Error removing worker from task",
      error: err.message
    });
  }
};

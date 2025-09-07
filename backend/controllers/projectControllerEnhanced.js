// Enhanced Project Controller with Delete and Auto Report Removal
const Project = require('../models/Project');
const Task = require('../models/Task');
const Progress = require('../models/Progress'); // Assuming you have a Progress model
const User = require('../models/User');

// DELETE PROJECT WITH CASCADE DELETION
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get counts for logging
    const tasksCount = await Task.countDocuments({ project: id });
    const reportsCount = await Progress.countDocuments({ project: id });

    console.log(`Deleting project: ${project.name}`);
    console.log(`- Associated tasks: ${tasksCount}`);
    console.log(`- Associated reports: ${reportsCount}`);

    // Delete all associated data in the correct order
    
    // 1. Delete all progress reports for this project
    const deletedReports = await Progress.deleteMany({ project: id });
    console.log(`Deleted ${deletedReports.deletedCount} progress reports`);

    // 2. Delete all tasks for this project
    const deletedTasks = await Task.deleteMany({ project: id });
    console.log(`Deleted ${deletedTasks.deletedCount} tasks`);

    // 3. Remove project references from users (if any)
    await User.updateMany(
      { assignedProjects: id },
      { $pull: { assignedProjects: id } }
    );

    // 4. Finally delete the project itself
    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Project and all associated data deleted successfully',
      deletedData: {
        project: project.name,
        tasks: deletedTasks.deletedCount,
        reports: deletedReports.deletedCount
      }
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ 
      message: 'Error deleting project', 
      error: error.message 
    });
  }
};

// GET ALL PROJECTS WITH ENHANCED DATA
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('client', 'name company email')
      .populate('projectManager', 'name email')
      .populate('siteSupervisor', 'name email')
      .populate('financeManager', 'name email')
      .sort({ createdAt: -1 });

    // Enhance projects with task and report counts
    const enhancedProjects = await Promise.all(
      projects.map(async (project) => {
        const tasksCount = await Task.countDocuments({ project: project._id });
        const completedTasksCount = await Task.countDocuments({ 
          project: project._id, 
          status: 'Completed' 
        });
        const reportsCount = await Progress.countDocuments({ project: project._id });
        
        return {
          ...project.toObject(),
          totalTasks: tasksCount,
          completedTasks: completedTasksCount,
          totalReports: reportsCount,
          calculatedProgress: tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      projects: enhancedProjects
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      message: 'Error fetching projects', 
      error: error.message 
    });
  }
};

// GET PROJECT BY ID WITH ENHANCED DATA
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('client', 'name company email phone address')
      .populate('projectManager', 'name email phone')
      .populate('siteSupervisor', 'name email phone')
      .populate('financeManager', 'name email phone');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get associated data
    const tasks = await Task.find({ project: id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const reports = await Progress.find({ project: id })
      .populate('reportedBy', 'name email')
      .sort({ date: -1 });

    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const calculatedProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        tasks,
        reports,
        totalTasks: tasks.length,
        completedTasks,
        totalReports: reports.length,
        calculatedProgress
      }
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      message: 'Error fetching project', 
      error: error.message 
    });
  }
};

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const projectData = req.body;
    
    // Create new project
    const project = new Project(projectData);
    await project.save();

    // Populate the created project
    const populatedProject = await Project.findById(project._id)
      .populate('client', 'name company email')
      .populate('projectManager', 'name email')
      .populate('siteSupervisor', 'name email')
      .populate('financeManager', 'name email');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ 
      message: 'Error creating project', 
      error: error.message 
    });
  }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const project = await Project.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    )
    .populate('client', 'name company email')
    .populate('projectManager', 'name email')
    .populate('siteSupervisor', 'name email')
    .populate('financeManager', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ 
      message: 'Error updating project', 
      error: error.message 
    });
  }
};

// UPDATE PROJECT STATUS
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      project
    });

  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ 
      message: 'Error updating project status', 
      error: error.message 
    });
  }
};

// GET PROJECTS BY SITE SUPERVISOR
const getProjectsBySiteSupervisor = async (req, res) => {
  try {
    const { supervisorId } = req.params;

    const projects = await Project.find({ siteSupervisor: supervisorId })
      .populate('client', 'name company')
      .populate('projectManager', 'name email')
      .sort({ createdAt: -1 });

    // Get tasks for these projects
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ 
      project: { $in: projectIds },
      assignedTo: supervisorId 
    });

    res.status(200).json({
      success: true,
      projects,
      tasks
    });

  } catch (error) {
    console.error('Error fetching supervisor projects:', error);
    res.status(500).json({ 
      message: 'Error fetching supervisor projects', 
      error: error.message 
    });
  }
};

// GET PROJECT STATISTICS
const getProjectStatistics = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ 
      status: { $in: ['Active', 'In Progress'] } 
    });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const plannedProjects = await Project.countDocuments({ status: 'Planning' });

    // Get projects by status
    const projectsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      }
    ]);

    // Get recent projects
    const recentProjects = await Project.find()
      .populate('client', 'name company')
      .populate('projectManager', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      statistics: {
        totalProjects,
        activeProjects,
        completedProjects,
        plannedProjects,
        projectsByStatus,
        recentProjects
      }
    });

  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({ 
      message: 'Error fetching project statistics', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject, // NEW: Enhanced delete function
  updateProjectStatus,
  getProjectsBySiteSupervisor,
  getProjectStatistics
};
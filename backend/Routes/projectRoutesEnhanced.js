// Enhanced Project Routes with Delete Functionality
const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject, // NEW: Delete function
  updateProjectStatus,
  getProjectsBySiteSupervisor,
  getProjectStatistics
} = require('../controllers/projectControllerEnhanced');

// GET /projects - Get all projects
router.get('/', getAllProjects);

// GET /projects/statistics - Get project statistics
router.get('/statistics', getProjectStatistics);

// GET /projects/site-supervisor/:supervisorId - Get projects by site supervisor
router.get('/site-supervisor/:supervisorId', getProjectsBySiteSupervisor);

// GET /projects/site-supervisor/:supervisorId/tasks - Get tasks for site supervisor
router.get('/site-supervisor/:supervisorId/tasks', async (req, res) => {
  try {
    const { supervisorId } = req.params;
    const Task = require('../models/Task');
    
    // Get tasks assigned to this supervisor
    const tasks = await Task.find({ assignedTo: supervisorId })
      .populate('project', 'name location status')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tasks
    });

  } catch (error) {
    console.error('Error fetching supervisor tasks:', error);
    res.status(500).json({ 
      message: 'Error fetching supervisor tasks', 
      error: error.message 
    });
  }
});

// GET /projects/:id - Get project by ID
router.get('/:id', getProjectById);

// POST /projects - Create new project
router.post('/', createProject);

// PUT /projects/:id - Update project
router.put('/:id', updateProject);

// PATCH /projects/:id/status - Update project status
router.patch('/:id/status', updateProjectStatus);

// DELETE /projects/:id - Delete project with cascade deletion
router.delete('/:id', deleteProject);

module.exports = router;
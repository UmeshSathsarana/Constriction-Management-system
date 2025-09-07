const express = require('express');
const {
  createProgress,
  getProgressByProject,
  getLatestProgress,
  getAllProgress,
  getProgressById,
  updateProgress,
  approveProgress,
  deleteProgress
} = require('../controllers/progressController');

const router = express.Router();

// Basic CRUD routes
router.post('/', createProgress);
router.get('/', getAllProgress);
router.get('/latest', getLatestProgress);
router.get('/:id', getProgressById);
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

// Project-specific routes
router.get('/project/:projectId', getProgressByProject);

// Approval routes
router.patch('/:id/approve', approveProgress);

module.exports = router;
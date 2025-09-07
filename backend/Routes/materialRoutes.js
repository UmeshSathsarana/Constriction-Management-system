// routes/materialRoutes.js
const express = require('express');
const {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  updateStock,
  getLowStockMaterials,
  getOutOfStockMaterials,
  getStockHistory,
  getMaterialsByProject,
  getMaterialStats
} = require('../controllers/materialController');

const router = express.Router();

// Basic CRUD routes
router.post('/', createMaterial);
router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.put('/:id', updateMaterial);
router.delete('/:id', deleteMaterial);

// Stock management routes
router.patch('/:id/stock', updateStock);
router.get('/status/low-stock', getLowStockMaterials);
router.get('/status/out-of-stock', getOutOfStockMaterials);
router.get('/:id/history', getStockHistory);

// Project-specific routes
router.get('/project/:projectId', getMaterialsByProject);

// Statistics route
router.get('/stats/dashboard', getMaterialStats);

module.exports = router;
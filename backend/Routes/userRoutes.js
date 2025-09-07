const express = require('express');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');

const router = express.Router();

console.log('🔍 Imported functions check:', {
  createUser: typeof createUser,
  getAllUsers: typeof getAllUsers,
  getUserById: typeof getUserById,
  updateUser: typeof updateUser,
  deleteUser: typeof deleteUser,
  toggleUserStatus: typeof toggleUserStatus
});

// Basic CRUD Routes for Construction Management Employee System
router.post('/', createUser);        // CREATE - Add new employee
router.get('/', getAllUsers);        // READ - Get all employees
router.get('/:id', getUserById);     // READ - Get specific employee
router.put('/:id', updateUser);      // UPDATE - Update employee details
router.patch('/:id/status', toggleUserStatus); // TOGGLE - Toggle user active status
router.delete('/:id', deleteUser);   // DELETE - Remove employee

module.exports = router;

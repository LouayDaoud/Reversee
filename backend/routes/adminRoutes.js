const express = require('express');
const { 
  getAllUsers,
  getUserById,
  getUserHabits,
  getAdminStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin permissions
router.use(protect);
router.use(adminOnly);

// Admin dashboard stats
router.get('/stats', getAdminStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/habits', getUserHabits);

module.exports = router; 
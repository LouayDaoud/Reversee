const express = require('express');
const { 
  getAllUsers,
  getUserById,
  getUserHabits,
  getAdminStats
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const scheduledHabitRoutes = require('./scheduledHabitRoutes');
const {
  getAllHabitDNA,
  getUserHabitDNA,
  regenerateHabitDNA
} = require('../controllers/habitDNAController');
const {
  getAllARSessions
} = require('../controllers/arController');

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

// Scheduled habits management
router.use('/scheduled-habits', scheduledHabitRoutes);

// Habit DNA management
router.get('/habit-dna', getAllHabitDNA);
router.get('/habit-dna/:userId', getUserHabitDNA);
router.post('/habit-dna/:userId/regenerate', regenerateHabitDNA);

// AR sessions management
router.get('/ar/sessions', getAllARSessions);

module.exports = router; 
const express = require('express');
const {
  assignScheduledHabit,
  getAllScheduledHabits,
  getScheduledHabitById,
  updateScheduledHabit,
  deleteScheduledHabit
} = require('../controllers/scheduledHabitController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Admin routes - require admin permissions
router.use(protect);
router.use(adminOnly);

router.route('/')
  .post(assignScheduledHabit)
  .get(getAllScheduledHabits);

router.route('/:id')
  .get(getScheduledHabitById)
  .put(updateScheduledHabit)
  .delete(deleteScheduledHabit);

module.exports = router;


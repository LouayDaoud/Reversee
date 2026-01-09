const express = require('express');
const {
  getMyScheduledHabits,
  getScheduledHabitsForCalendar
} = require('../controllers/scheduledHabitController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// User routes - require authentication
router.use(protect);

router.get('/', getMyScheduledHabits);
router.get('/calendar', getScheduledHabitsForCalendar);

module.exports = router;


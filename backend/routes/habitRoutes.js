const express = require('express');
const { 
  createHabit, 
  getHabits, 
  getHabit, 
  updateHabit, 
  deleteHabit 
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .post(createHabit)
  .get(getHabits);

router.route('/:id')
  .get(getHabit)
  .put(updateHabit)
  .delete(deleteHabit);

module.exports = router;

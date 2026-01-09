const express = require('express');
const {
  getMyHabitDNA,
  updateHabitDNA,
  getCompatibility,
  toggleVisibility
} = require('../controllers/habitDNAController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// User routes - require authentication
router.use(protect);

router.get('/', getMyHabitDNA);
router.put('/', updateHabitDNA);
router.put('/visibility', toggleVisibility);
router.get('/compatibility/:userId', getCompatibility);

module.exports = router;


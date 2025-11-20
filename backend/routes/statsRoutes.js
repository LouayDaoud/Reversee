const express = require('express');
const { 
  getStatistics,
  getProductivityScore,
  getInsights
} = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Add logging middleware
router.use((req, res, next) => {
  console.log(`Stats API called: ${req.method} ${req.originalUrl}`);
  next();
});

// Protect all routes
router.use(protect);

router.get('/', getStatistics);
router.get('/productivity', getProductivityScore);
router.get('/insights', getInsights);

module.exports = router; 
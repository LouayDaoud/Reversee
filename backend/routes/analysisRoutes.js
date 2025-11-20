const express = require('express');
const {
  getHabitAnalysis,
  getAIInsights,
  getRecommendations,
  getWeeklyReport
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Analysis routes working!' });
});

// All routes are protected (require authentication)
router.get('/habits', protect, getHabitAnalysis);
router.get('/ai-insights', protect, getAIInsights);
router.get('/recommendations', protect, getRecommendations);
router.get('/weekly-report', protect, getWeeklyReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  generateResponse,
  getModels,
  getActiveModel,
  createModel,
  updateModel,
  deleteModel,
  testModel
} = require('../controllers/aiController');

// Generate AI response (public for authenticated users)
router.post('/generate', protect, generateResponse);

// Get active AI model
router.get('/model/active', protect, getActiveModel);

// Admin routes for model management
router.get('/models', protect, adminOnly, getModels);
router.post('/models', protect, adminOnly, createModel);
router.put('/models/:id', protect, adminOnly, updateModel);
router.delete('/models/:id', protect, adminOnly, deleteModel);
router.post('/models/:id/test', protect, adminOnly, testModel);

module.exports = router;




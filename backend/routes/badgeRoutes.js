const express = require('express');
const {
  getAllBadges,
  getUserBadges,
  markBadgeAsViewed,
  createBadge,
  updateBadge,
  deleteBadge,
  checkAndAwardBadges,
  assignBadgeToUser
} = require('../controllers/badgeController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllBadges);

// User routes
router.get('/me', protect, getUserBadges);
router.put('/:id/view', protect, markBadgeAsViewed);
router.post('/check', protect, checkAndAwardBadges);

// Admin routes
router.post('/', protect, adminOnly, createBadge);
router.put('/:id', protect, adminOnly, updateBadge);
router.delete('/:id', protect, adminOnly, deleteBadge);
router.post('/:id/assign', protect, adminOnly, assignBadgeToUser);

module.exports = router;

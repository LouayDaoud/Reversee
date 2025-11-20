const express = require('express');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// User routes
router.get('/', protect, getUserNotifications);
router.get('/unread/count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

// Admin routes
router.post('/', protect, adminOnly, createNotification);
router.delete('/:id', protect, adminOnly, deleteNotification);

module.exports = router;

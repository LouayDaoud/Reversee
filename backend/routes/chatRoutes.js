const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createConversation,
  addMessage,
  getUserConversations,
  getConversation,
  getAllConversations,
  deleteConversation,
  generateAIResponse
} = require('../controllers/chatController');

// Create a new conversation
router.post('/', protect, createConversation);

// Add a message to a conversation
router.post('/:conversationId/messages', protect, addMessage);

// Generate AI response for a conversation
router.post('/:conversationId/ai-response', protect, generateAIResponse);

// Get all conversations for the current user
router.get('/me', protect, getUserConversations);

// Get a specific conversation
router.get('/:conversationId', protect, getConversation);

// Admin: Get all conversations
router.get('/', protect, adminOnly, getAllConversations);

// Delete a conversation
router.delete('/:conversationId', protect, deleteConversation);

module.exports = router;

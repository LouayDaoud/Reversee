const ChatConversation = require('../models/ChatConversation');
const User = require('../models/User');

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    console.log('Creating new conversation...');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const { triggerHabitId } = req.body;
    const userId = req.user.id;

    console.log('User ID:', userId);
    console.log('Trigger Habit ID:', triggerHabitId);

    const newConversation = new ChatConversation({
      user: userId,
      messages: [],
      triggerHabit: triggerHabitId || null
    });

    console.log('New conversation object:', newConversation);

    const savedConversation = await newConversation.save();
    console.log('Conversation saved successfully:', savedConversation);

    res.status(201).json({
      success: true,
      data: savedConversation
    });
  } catch (err) {
    console.error('Error creating conversation:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Add a message to a conversation
exports.addMessage = async (req, res) => {
  try {
    console.log('Adding message to conversation...');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const { conversationId } = req.params;
    const { text, sender } = req.body;
    const userId = req.user.id;

    console.log('Conversation ID:', conversationId);
    console.log('Message text:', text);
    console.log('Message sender:', sender);
    console.log('User ID:', userId);

    // Find the conversation and make sure it belongs to the user
    const conversation = await ChatConversation.findById(conversationId);

    console.log('Found conversation:', conversation);

    if (!conversation) {
      console.log('Conversation not found');
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if the conversation belongs to the user or if user is admin
    if (conversation.user.toString() !== userId && !req.user.isAdmin) {
      console.log('User not authorized to access this conversation');
      console.log('Conversation user ID:', conversation.user.toString());
      console.log('Request user ID:', userId);
      console.log('Is admin:', req.user.isAdmin);

      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    // Add the message
    conversation.messages.push({
      text,
      sender,
      timestamp: Date.now()
    });

    console.log('Message added to conversation');

    const savedConversation = await conversation.save();
    console.log('Conversation saved with new message');

    res.status(200).json({
      success: true,
      data: savedConversation
    });
  } catch (err) {
    console.error('Error adding message:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get all conversations for a user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await ChatConversation.find({ user: userId })
      .sort({ lastUpdatedAt: -1 })
      .populate('triggerHabit', 'name category');

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    console.error('Error getting user conversations:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Get a specific conversation
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await ChatConversation.findById(conversationId)
      .populate('triggerHabit', 'name category')
      .populate('user', 'firstName lastName email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if the conversation belongs to the user or if user is admin
    if (conversation.user._id.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this conversation'
      });
    }

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (err) {
    console.error('Error getting conversation:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Admin: Get all conversations
exports.getAllConversations = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const conversations = await ChatConversation.find()
      .sort({ lastUpdatedAt: -1 })
      .populate('user', 'firstName lastName email')
      .populate('triggerHabit', 'name category');

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (err) {
    console.error('Error getting all conversations:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await ChatConversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if the conversation belongs to the user or if user is admin
    if (conversation.user.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this conversation'
      });
    }

    await ChatConversation.deleteOne({ _id: conversationId });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

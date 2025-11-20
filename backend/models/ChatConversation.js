const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  },
  // Optional reference to a habit that triggered this conversation
  triggerHabit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit'
  }
});

// Update lastUpdatedAt when messages are added
chatConversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastUpdatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('ChatConversation', chatConversationSchema);

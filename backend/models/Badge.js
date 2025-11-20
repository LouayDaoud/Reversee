const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['achievement', 'milestone', 'consistency', 'special'],
    default: 'achievement'
  },
  criteria: {
    type: {
      type: String,
      enum: ['habit_count', 'streak', 'category_count', 'days_active', 'custom'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      default: null
    }
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  color: {
    type: String,
    default: 'blue'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', BadgeSchema);

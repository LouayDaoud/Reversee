const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['sleep', 'exercise', 'screen', 'mood', 'stress', 'nutrition', 'other']
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'Value is required']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

// Index for efficient querying by user and date
HabitSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Habit', HabitSchema);

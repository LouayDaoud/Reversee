const mongoose = require('mongoose');

const ScheduledHabitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Admin who assigned is required']
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
  targetValue: {
    type: Number,
    required: [true, 'Target value is required']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  // Récurrence: daily, weekly, custom
  recurrence: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  // Jours de la semaine pour weekly (0 = dimanche, 6 = samedi)
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6
  }],
  // Date de début
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Date de fin (optionnel, null = pas de fin)
  endDate: {
    type: Date,
    default: null
  },
  // Heure préférée pour le rappel (format HH:MM)
  preferredTime: {
    type: String,
    default: null
  },
  // Notes/instructions pour l'utilisateur
  instructions: {
    type: String,
    trim: true
  },
  // Statut: active, paused, completed, cancelled
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  // Indique si l'habitude doit être créée automatiquement
  autoCreate: {
    type: Boolean,
    default: true
  },
  // Historique des habitudes créées à partir de cette planification
  createdHabits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour requêtes efficaces
ScheduledHabitSchema.index({ user: 1, status: 1, startDate: 1 });
ScheduledHabitSchema.index({ assignedBy: 1, createdAt: -1 });
ScheduledHabitSchema.index({ status: 1, startDate: 1 });

// Mettre à jour updatedAt avant sauvegarde
ScheduledHabitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ScheduledHabit', ScheduledHabitSchema);


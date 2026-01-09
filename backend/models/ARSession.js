const mongoose = require('mongoose');

const ARSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Type de session AR
  sessionType: {
    type: String,
    enum: ['habit_visualization', 'meditation', 'collection', 'custom'],
    required: true
  },
  // Habitudes visualisées dans cette session
  habits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit'
  }],
  // Objets AR créés/collectionnés
  arObjects: [{
    type: {
      type: String,
      enum: ['plant', 'crystal', 'statue', 'badge', 'custom']
    },
    position: {
      x: Number,
      y: Number,
      z: Number
    },
    rotation: {
      x: Number,
      y: Number,
      z: Number
    },
    scale: {
      x: Number,
      y: Number,
      z: Number
    },
    color: String,
    metadata: {
      habitId: mongoose.Schema.Types.ObjectId,
      unlockedAt: Date,
      level: Number
    }
  }],
  // QR codes scannés
  scannedQRCodes: [{
    code: String,
    scannedAt: Date,
    triggeredHabit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit'
    }
  }],
  // Configuration de la session
  config: {
    environment: {
      type: String,
      enum: ['indoor', 'outdoor', 'custom'],
      default: 'indoor'
    },
    lighting: {
      type: String,
      enum: ['natural', 'warm', 'cool', 'custom'],
      default: 'natural'
    },
    effects: {
      particles: {
        type: Boolean,
        default: true
      },
      shadows: {
        type: Boolean,
        default: true
      },
      animations: {
        type: Boolean,
        default: true
      }
    }
  },
  // Statistiques de la session
  stats: {
    duration: {
      type: Number, // en secondes
      default: 0
    },
    objectsCreated: {
      type: Number,
      default: 0
    },
    interactions: {
      type: Number,
      default: 0
    }
  },
  // Screenshots/captures de la session
  captures: [{
    url: String,
    timestamp: Date,
    description: String
  }],
  // Partage
  isShared: {
    type: Boolean,
    default: false
  },
  sharedAt: {
    type: Date
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour recherches efficaces
ARSessionSchema.index({ user: 1, startedAt: -1 });
ARSessionSchema.index({ sessionType: 1, isShared: 1 });

module.exports = mongoose.model('ARSession', ARSessionSchema);


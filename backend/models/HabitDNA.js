const mongoose = require('mongoose');

const HabitDNASchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Code ADN unique généré à partir des patterns d'habitudes
  dnaSequence: {
    type: String,
    required: true,
    unique: true
  },
  // Version de l'algorithme utilisé
  algorithmVersion: {
    type: String,
    default: '1.0'
  },
  // Composants de l'ADN (basés sur différents aspects des habitudes)
  components: {
    consistency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    diversity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    intensity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    balance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    growth: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  // Couleurs associées à l'ADN (pour visualisation)
  colors: {
    primary: {
      type: String,
      default: '#000000'
    },
    secondary: {
      type: String,
      default: '#FFFFFF'
    },
    accent: {
      type: String,
      default: '#FF0000'
    }
  },
  // Pattern visuel (séquence de couleurs)
  visualPattern: [{
    color: String,
    position: Number
  }],
  // Historique des mutations (changements majeurs)
  mutations: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['major_change', 'new_habit', 'consistency_improvement', 'diversity_increase']
    },
    description: String,
    previousDNA: String
  }],
  // Compatibilité avec d'autres utilisateurs (pour groupes)
  compatibility: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    factors: [String]
  }],
  // Statistiques
  stats: {
    totalHabits: {
      type: Number,
      default: 0
    },
    activeStreaks: {
      type: Number,
      default: 0
    },
    averageCompletion: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Prédictions basées sur l'ADN
  predictions: {
    nextMilestone: {
      type: String
    },
    recommendedHabits: [{
      category: String,
      name: String,
      reason: String
    }],
    riskFactors: [{
      type: String,
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }]
  },
  // Partage public (optionnel)
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour recherches efficaces
HabitDNASchema.index({ user: 1 });
HabitDNASchema.index({ dnaSequence: 1 });
HabitDNASchema.index({ isPublic: 1, updatedAt: -1 });
HabitDNASchema.index({ 'components.consistency': 1, 'components.diversity': 1 });

// Mettre à jour updatedAt avant sauvegarde
HabitDNASchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('HabitDNA', HabitDNASchema);


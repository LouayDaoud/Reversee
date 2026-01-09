const mongoose = require('mongoose');

const AIModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Model name is required'],
    unique: true,
    trim: true
  },
  provider: {
    type: String,
    enum: ['openai', 'anthropic', 'local', 'custom'],
    required: [true, 'Provider is required']
  },
  modelId: {
    type: String,
    required: [true, 'Model ID is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Configuration spécifique au modèle
  config: {
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 500
    },
    topP: {
      type: Number,
      default: 1.0
    },
    frequencyPenalty: {
      type: Number,
      default: 0
    },
    presencePenalty: {
      type: Number,
      default: 0
    }
  },
  // System prompt par défaut
  systemPrompt: {
    type: String,
    default: 'Vous êtes un assistant IA spécialisé dans le suivi et l\'amélioration des habitudes de vie. Vous donnez des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être.'
  },
  // API endpoint (pour les providers custom)
  apiEndpoint: {
    type: String,
    trim: true
  },
  // API key (optionnel, peut être stocké dans .env)
  requiresApiKey: {
    type: Boolean,
    default: true
  },
  // Statut du modèle
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  // Statistiques d'utilisation
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Mettre à jour updatedAt avant chaque sauvegarde
AIModelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// S'assurer qu'il n'y a qu'un seul modèle par défaut
AIModelSchema.pre('save', async function(next) {
  if (this.isDefault && this.isNew) {
    await mongoose.model('AIModel').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Index pour les recherches fréquentes
AIModelSchema.index({ isActive: 1, isDefault: 1 });
AIModelSchema.index({ provider: 1, modelId: 1 });

module.exports = mongoose.model('AIModel', AIModelSchema);




/**
 * Script d'initialisation pour créer un modèle IA par défaut
 * Usage: node scripts/init-ai-model.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AIService = require('../services/aiService');
const AIModel = require('../models/AIModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reversee';

async function initAIModel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Vérifier si un modèle par défaut existe déjà
    const existingModel = await AIModel.findOne({ isDefault: true });
    if (existingModel) {
      console.log('ℹ️  Un modèle IA par défaut existe déjà:', existingModel.name);
      console.log('   Provider:', existingModel.provider);
      console.log('   Model ID:', existingModel.modelId);
      await mongoose.connection.close();
      return;
    }

    // Créer un modèle par défaut
    console.log('📝 Création d\'un modèle IA par défaut...');
    const defaultModel = await AIService.createDefaultModel();

    if (defaultModel) {
      console.log('✅ Modèle IA par défaut créé avec succès!');
      console.log('   Nom:', defaultModel.name);
      console.log('   Provider:', defaultModel.provider);
      console.log('   Model ID:', defaultModel.modelId);
      console.log('\n💡 Pour utiliser OpenAI ou Anthropic, créez un nouveau modèle via l\'API admin.');
    } else {
      console.log('❌ Erreur lors de la création du modèle IA par défaut');
    }

    await mongoose.connection.close();
    console.log('✅ Connexion MongoDB fermée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
initAIModel();




/**
 * Script pour configurer un modèle ML local (Ollama)
 * Usage: node scripts/setup-local-ml.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');
const LocalMLService = require('../services/localMLService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reversee';

async function setupLocalML() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Vérifier si Ollama est disponible
    console.log('\n🔍 Vérification de la disponibilité d\'Ollama...');
    const availability = await LocalMLService.checkLocalModelAvailability('llama3');
    
    if (!availability.available) {
      console.error('❌ Ollama n\'est pas disponible');
      console.log('💡 Installez Ollama depuis https://ollama.ai');
      console.log('💡 Démarrez Ollama et réessayez');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ Ollama est disponible');
    
    // Vérifier si le modèle llama3 est installé
    if (!availability.modelExists) {
      console.log('\n⚠️  Le modèle llama3 n\'est pas installé.');
      console.log('💡 Téléchargez-le avec l\'une de ces méthodes:');
      console.log('   1. Via l\'interface Ollama (recommandé)');
      console.log('   2. Via la ligne de commande: ollama pull llama3');
      console.log('   3. Via le script: node scripts/download-llama3.js');
      console.log('\n🔄 Configuration du modèle quand même... (il sera téléchargé automatiquement au premier appel)');
    } else {
      console.log('✅ Le modèle llama3 est déjà installé');
    }

    // Désactiver tous les autres modèles par défaut
    await AIModel.updateMany(
      { isDefault: true },
      { isDefault: false }
    );

    // Vérifier si un modèle local existe déjà
    let localModel = await AIModel.findOne({ 
      provider: 'local',
      modelId: 'llama3'
    });

    const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';

    if (localModel) {
      // Mettre à jour le modèle existant
      localModel.isActive = true;
      localModel.isDefault = true;
      localModel.apiEndpoint = endpoint;
      localModel.config = {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      };
      localModel.systemPrompt = `Vous êtes un assistant IA spécialisé dans le suivi et l'amélioration des habitudes de vie. Vous donnez des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être.`;
      await localModel.save();
      console.log('✅ Modèle ML local mis à jour et défini comme modèle par défaut');
    } else {
      // Créer un nouveau modèle local
      localModel = await AIModel.create({
        name: 'Llama 3 (Local ML)',
        provider: 'local',
        modelId: 'llama3',
        description: 'Modèle ML local Llama 3 via Ollama - Gratuit et sans quota',
        config: {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 0.9,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        systemPrompt: `Vous êtes un assistant IA spécialisé dans le suivi et l'amélioration des habitudes de vie. Vous donnez des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être. Répondez toujours en français, soyez naturel, chaleureux et encourageant.`,
        apiEndpoint: endpoint,
        isActive: true,
        isDefault: true,
        requiresApiKey: false
      });
      console.log('✅ Modèle ML local créé et défini comme modèle par défaut');
    }

    console.log('\n📋 Configuration du modèle:');
    console.log(`   Nom: ${localModel.name}`);
    console.log(`   Provider: ${localModel.provider}`);
    console.log(`   Model ID: ${localModel.modelId}`);
    console.log(`   Endpoint: ${localModel.apiEndpoint}`);
    console.log(`   Temperature: ${localModel.config.temperature}`);
    console.log(`   Max Tokens: ${localModel.config.maxTokens}`);
    console.log(`   Actif: ${localModel.isActive}`);
    console.log(`   Par défaut: ${localModel.isDefault}`);

    console.log('\n✅ Configuration du modèle ML local terminée avec succès!');
    console.log('💡 Toutes les réponses de l\'Assistant IA utiliseront maintenant le modèle ML local.');
    console.log('💰 Avantage: Gratuit, sans quota, et vos données restent locales!');

    await mongoose.connection.close();
    console.log('✅ Connexion MongoDB fermée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
setupLocalML();


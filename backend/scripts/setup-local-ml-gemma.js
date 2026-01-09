/**
 * Script pour configurer le modèle ML local Gemma 3:4b (ou autre modèle)
 * Usage: node scripts/setup-local-ml-gemma.js [modelName]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');
const LocalMLService = require('../services/localMLService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reversee';
const MODEL_NAME = process.argv[2] || 'gemma3:4b'; // Utilise gemma3:4b par défaut

async function setupLocalML() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Vérifier si Ollama est disponible
    console.log(`\n🔍 Vérification de la disponibilité d'Ollama et du modèle ${MODEL_NAME}...`);
    const availability = await LocalMLService.checkLocalModelAvailability(MODEL_NAME);
    
    if (!availability.available) {
      console.error('❌ Ollama n\'est pas disponible');
      console.log('💡 Assurez-vous qu\'Ollama est démarré');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('✅ Ollama est disponible');
    
    if (availability.models.length > 0) {
      console.log(`📋 Modèles disponibles: ${availability.models.join(', ')}`);
    }

    // Vérifier si le modèle est installé
    if (!availability.modelExists) {
      console.log(`\n⚠️  Le modèle ${MODEL_NAME} n'est pas encore visible via l'API.`);
      console.log(`💡 Si vous venez de le télécharger, attendez quelques secondes et réessayez.`);
      console.log(`💡 Ou téléchargez-le via l'interface Ollama ou avec: ollama pull ${MODEL_NAME}`);
      console.log(`\n🔄 Tentative de configuration quand même... (le modèle sera testé lors de la première utilisation)`);
    } else {
      console.log(`✅ Le modèle ${MODEL_NAME} est installé`);
    }

    // Désactiver tous les autres modèles par défaut
    await AIModel.updateMany(
      { isDefault: true },
      { isDefault: false }
    );

    // Vérifier si un modèle local existe déjà
    let localModel = await AIModel.findOne({ 
      provider: 'local',
      modelId: MODEL_NAME
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
      localModel.systemPrompt = `Vous êtes un assistant IA spécialisé dans le suivi et l'amélioration des habitudes de vie. Vous donnez des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être. Répondez toujours en français, soyez naturel, chaleureux et encourageant.`;
      await localModel.save();
      console.log(`✅ Modèle ML local (${MODEL_NAME}) mis à jour et défini comme modèle par défaut`);
    } else {
      // Créer un nouveau modèle local
      localModel = await AIModel.create({
        name: `Gemma 3:4b (Local ML)`,
        provider: 'local',
        modelId: MODEL_NAME,
        description: `Modèle ML local ${MODEL_NAME} via Ollama - Gratuit et sans quota`,
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
      console.log(`✅ Modèle ML local (${MODEL_NAME}) créé et défini comme modèle par défaut`);
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




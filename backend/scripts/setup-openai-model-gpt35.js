/**
 * Script pour configurer GPT-3.5 Turbo (moins cher, plus rapide)
 * Usage: node scripts/setup-openai-model-gpt35.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reversee';

async function setupOpenAIModel() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Vérifier si la clé OpenAI est configurée
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY n\'est pas configurée dans le fichier .env');
      console.log('💡 Ajoutez OPENAI_API_KEY=votre_clé dans votre fichier .env');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Désactiver tous les autres modèles par défaut
    await AIModel.updateMany(
      { isDefault: true },
      { isDefault: false }
    );

    // Utiliser GPT-3.5 Turbo (moins cher et plus rapide)
    const modelId = 'gpt-3.5-turbo';
    
    // Vérifier si un modèle OpenAI existe déjà
    let openaiModel = await AIModel.findOne({ 
      provider: 'openai',
      modelId: modelId
    });

    if (openaiModel) {
      // Mettre à jour le modèle existant
      openaiModel.isActive = true;
      openaiModel.isDefault = true;
      openaiModel.config = {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
        frequencyPenalty: 0,
        presencePenalty: 0
      };
      openaiModel.systemPrompt = `Vous êtes un assistant IA spécialisé dans le suivi et l'amélioration des habitudes de vie. Vous donnez des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être. Vous analysez leurs habitudes, leurs statistiques et leur fournissez des insights personnalisés basés sur leurs données réelles. Répondez toujours en français, soyez naturel, chaleureux et encourageant.`;
      await openaiModel.save();
      console.log('✅ Modèle OpenAI GPT-3.5 Turbo mis à jour et défini comme modèle par défaut');
    } else {
      // Créer un nouveau modèle OpenAI
      openaiModel = await AIModel.create({
        name: 'OpenAI GPT-3.5 Turbo',
        provider: 'openai',
        modelId: modelId,
        description: 'Modèle GPT-3.5 Turbo d\'OpenAI - Plus rapide et moins cher que GPT-4',
        config: {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        systemPrompt: `Vous êtes un assistant IA spécialisé dans le suivi et l'amélioration des habitudes de vie. Vous donnez des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être. Vous analysez leurs habitudes, leurs statistiques et leur fournissez des insights personnalisés basés sur leurs données réelles. Répondez toujours en français, soyez naturel, chaleureux et encourageant.`,
        isActive: true,
        isDefault: true,
        requiresApiKey: true
      });
      console.log('✅ Modèle OpenAI GPT-3.5 Turbo créé et défini comme modèle par défaut');
    }

    console.log('\n📋 Configuration du modèle:');
    console.log(`   Nom: ${openaiModel.name}`);
    console.log(`   Provider: ${openaiModel.provider}`);
    console.log(`   Model ID: ${openaiModel.modelId}`);
    console.log(`   Temperature: ${openaiModel.config.temperature}`);
    console.log(`   Max Tokens: ${openaiModel.config.maxTokens}`);
    console.log(`   Actif: ${openaiModel.isActive}`);
    console.log(`   Par défaut: ${openaiModel.isDefault}`);

    console.log('\n✅ Configuration OpenAI terminée avec succès!');
    console.log('💡 Toutes les réponses de l\'Assistant IA utiliseront maintenant ChatGPT (GPT-3.5 Turbo).');
    console.log('💰 GPT-3.5 Turbo est moins cher et plus rapide que GPT-4.');

    await mongoose.connection.close();
    console.log('✅ Connexion MongoDB fermée');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
setupOpenAIModel();




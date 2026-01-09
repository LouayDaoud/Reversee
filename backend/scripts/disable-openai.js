/**
 * Script pour désactiver tous les modèles OpenAI
 * Usage: node scripts/disable-openai.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AIModel = require('../models/AIModel');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reversee';

async function disableOpenAI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Désactiver tous les modèles OpenAI
    const result = await AIModel.updateMany(
      { provider: 'openai' },
      { 
        isActive: false,
        isDefault: false
      }
    );

    console.log(`\n✅ ${result.modifiedCount} modèle(s) OpenAI désactivé(s)`);

    // Vérifier s'il reste un modèle actif
    const activeModel = await AIModel.findOne({ isActive: true, isDefault: true });
    
    if (!activeModel) {
      console.log('\n⚠️  Aucun modèle actif trouvé.');
      console.log('💡 Configurez un modèle ML local avec: node scripts/setup-local-ml.js');
    } else {
      console.log(`\n✅ Modèle actif: ${activeModel.name} (${activeModel.provider})`);
    }

    // Lister tous les modèles
    console.log('\n📋 Liste des modèles:');
    const allModels = await AIModel.find({}).sort({ provider: 1, name: 1 });
    allModels.forEach(model => {
      const status = model.isActive ? (model.isDefault ? '✅ ACTIF (défaut)' : '✅ ACTIF') : '❌ INACTIF';
      console.log(`   - ${model.name} (${model.provider}): ${status}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Connexion MongoDB fermée');
    console.log('\n🎉 OpenAI a été désactivé avec succès!');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
disableOpenAI();




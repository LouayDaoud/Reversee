/**
 * Script pour tester le modèle ML local (Ollama)
 * Usage: node scripts/test-local-ml.js
 */

require('dotenv').config();
const LocalMLService = require('../services/localMLService');

async function testLocalML() {
  console.log('🚀 Test du modèle ML local (Ollama)...\n');

  // 1. Vérifier la disponibilité
  const modelName = process.argv[2] || 'gemma3:4b'; // Utilise gemma3:4b par défaut
  console.log(`1️⃣  Vérification de la disponibilité d'Ollama et du modèle ${modelName}...`);
  const availability = await LocalMLService.checkLocalModelAvailability(modelName);
  
  if (!availability.available) {
    console.error('❌ Ollama n\'est pas disponible');
    console.log('💡 Installez Ollama depuis https://ollama.ai');
    console.log('💡 Démarrez Ollama et réessayez');
    process.exit(1);
  }

  console.log('✅ Ollama est disponible');
  console.log(`   Modèles disponibles: ${availability.models.join(', ')}`);

  if (!availability.modelExists) {
    console.log(`\n⚠️  Le modèle ${modelName} n'est pas encore visible via l'API.`);
    console.log(`💡 Si vous venez de le télécharger, attendez quelques secondes.`);
    console.log(`💡 Ou téléchargez-le avec: ollama pull ${modelName}`);
    console.log(`\n🔄 Test quand même... (le modèle sera chargé lors du premier appel)\n`);
  } else {
    console.log(`✅ Le modèle ${modelName} est installé\n`);
  }

  // 2. Tester une réponse simple
  console.log('2️⃣  Test de génération de réponse...');
  try {
    const testMessage = 'Bonjour ! Peux-tu me dire bonjour en français ?';
    console.log(`   Message de test: "${testMessage}"`);
    console.log(`   Modèle utilisé: ${modelName}`);
    
    // Utiliser directement callLocalModel pour éviter les problèmes avec enrichContext
    const messages = [
      {
        role: 'system',
        content: 'Tu es un assistant IA. Réponds toujours en français de manière naturelle et chaleureuse.'
      },
      {
        role: 'user',
        content: testMessage
      }
    ];
    
    const response = await LocalMLService.callLocalModel(messages, modelName);

    console.log(`✅ Réponse reçue:`);
    console.log(`   "${response}"\n`);
    console.log('🎉 Test réussi ! Le modèle ML local fonctionne correctement.');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  }
}

testLocalML();


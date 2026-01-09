/**
 * Script pour supprimer un modèle Ollama et libérer de l'espace
 * Usage: node scripts/remove-ollama-model.js [modelName]
 * Exemple: node scripts/remove-ollama-model.js llama3
 */

require('dotenv').config();
const axios = require('axios');

const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';
const modelName = process.argv[2] || 'llama3';

async function removeModel() {
  console.log(`🗑️  Suppression du modèle ${modelName}...\n`);
  
  try {
    // Vérifier d'abord si le modèle existe
    console.log('🔍 Vérification des modèles disponibles...');
    const listResponse = await axios.get(`${endpoint}/api/tags`);
    const availableModels = listResponse.data.models || [];
    const modelExists = availableModels.some(m => m.name.includes(modelName));
    
    if (!modelExists) {
      console.log(`⚠️  Le modèle ${modelName} n'est pas trouvé dans Ollama.`);
      console.log(`📋 Modèles disponibles: ${availableModels.map(m => m.name).join(', ') || 'Aucun'}`);
      process.exit(0);
    }
    
    console.log(`✅ Modèle ${modelName} trouvé. Suppression en cours...`);
    
    // Supprimer le modèle
    const response = await axios.delete(
      `${endpoint}/api/delete`,
      {
        data: {
          name: modelName
        },
        timeout: 30000
      }
    );
    
    console.log(`\n✅ Modèle ${modelName} supprimé avec succès!`);
    console.log(`💾 Espace libéré: ~4.3 GB (pour llama3)`);
    
    // Afficher les modèles restants
    const newListResponse = await axios.get(`${endpoint}/api/tags`);
    const remainingModels = newListResponse.data.models || [];
    console.log(`\n📋 Modèles restants: ${remainingModels.map(m => m.name).join(', ') || 'Aucun'}`);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Ollama n\'est pas démarré.');
      console.log('💡 Assurez-vous que l\'application Ollama est ouverte.');
    } else if (error.response?.status === 404) {
      console.error(`\n❌ Le modèle ${modelName} n'existe pas.`);
    } else {
      console.error('\n❌ Erreur:', error.message);
      if (error.response?.data) {
        console.error('   Détails:', error.response.data);
      }
    }
    process.exit(1);
  }
}

removeModel();




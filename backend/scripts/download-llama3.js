/**
 * Script pour télécharger llama3 via l'API Ollama
 * Usage: node scripts/download-llama3.js
 */

require('dotenv').config();
const axios = require('axios');

const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';
const modelName = 'llama3';

async function downloadModel() {
  console.log(`📥 Téléchargement du modèle ${modelName} via Ollama...\n`);
  
  try {
    console.log('🔄 Démarrage du téléchargement (cela peut prendre plusieurs minutes)...');
    
    const response = await axios.post(
      `${endpoint}/api/pull`,
      {
        name: modelName,
        stream: false
      },
      {
        timeout: 600000, // 10 minutes pour le téléchargement
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            process.stdout.write(`\r📥 Progression: ${percentCompleted}%`);
          }
        }
      }
    );
    
    console.log('\n✅ Modèle téléchargé avec succès!');
    console.log(`\n💡 Vous pouvez maintenant configurer le modèle avec:`);
    console.log(`   node scripts/setup-local-ml.js`);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Ollama n\'est pas démarré.');
      console.log('💡 Démarrez Ollama et réessayez.');
    } else if (error.response) {
      console.error('\n❌ Erreur:', error.response.data);
    } else {
      console.error('\n❌ Erreur:', error.message);
    }
    process.exit(1);
  }
}

downloadModel();




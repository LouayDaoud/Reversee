/**
 * Script pour télécharger llama3 via l'API Ollama (sans commande CLI)
 * Usage: node scripts/pull-llama3-api.js
 */

require('dotenv').config();
const axios = require('axios');

const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';

async function pullModel() {
  console.log('📥 Téléchargement de llama3 via l\'API Ollama...\n');
  console.log('⏳ Cela peut prendre plusieurs minutes selon votre connexion internet...\n');
  
  try {
    const response = await axios.post(
      `${endpoint}/api/pull`,
      {
        name: 'llama3',
        stream: false
      },
      {
        timeout: 600000, // 10 minutes
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            process.stdout.write(`\r📥 Progression: ${percent}%`);
          } else {
            process.stdout.write(`\r📥 Téléchargement en cours...`);
          }
        }
      }
    );
    
    console.log('\n\n✅ Modèle llama3 téléchargé avec succès!');
    console.log('\n💡 Le modèle est maintenant prêt à être utilisé dans votre application.');
    console.log('💡 Redémarrez votre backend si nécessaire et testez le chatbot.');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Ollama n\'est pas démarré.');
      console.log('💡 Assurez-vous que l\'application Ollama est ouverte.');
    } else if (error.response?.status === 404) {
      console.error('\n❌ Erreur: Modèle non trouvé');
      console.log('💡 Vérifiez que le nom du modèle est correct: llama3');
    } else {
      console.error('\n❌ Erreur:', error.message);
      if (error.response?.data) {
        console.error('   Détails:', error.response.data);
      }
    }
    process.exit(1);
  }
}

pullModel();




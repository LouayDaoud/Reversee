/**
 * Script de test pour vérifier la configuration OpenAI
 * Usage: node scripts/test-openai.js
 */

require('dotenv').config();
const axios = require('axios');

async function testOpenAI() {
  console.log('🔍 Test de la configuration OpenAI...\n');

  // 1. Vérifier que la clé API est dans .env
  console.log('1️⃣  Vérification de la clé API...');
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY n\'est pas trouvée dans le fichier .env');
    console.log('💡 Ajoutez votre clé dans backend/.env :');
    console.log('   OPENAI_API_KEY=sk-votre-clé-ici\n');
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY.trim();
  
  if (apiKey === '' || apiKey === 'sk-votre-clé-api-ici') {
    console.error('❌ OPENAI_API_KEY est vide ou contient une valeur par défaut');
    console.log('💡 Remplacez par votre vraie clé API OpenAI\n');
    process.exit(1);
  }

  if (!apiKey.startsWith('sk-')) {
    console.warn('⚠️  La clé API ne commence pas par "sk-". Vérifiez que c\'est bien une clé OpenAI valide.');
  }

  console.log('✅ Clé API trouvée (longueur: ' + apiKey.length + ' caractères)');
  console.log('   Préfixe: ' + apiKey.substring(0, 7) + '...\n');

  // 2. Tester la connexion à l'API OpenAI
  console.log('2️⃣  Test de connexion à l\'API OpenAI...');
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Répondez simplement "OK" pour confirmer que la connexion fonctionne.'
          }
        ],
        max_tokens: 10
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Connexion réussie !');
    console.log('   Réponse: ' + response.data.choices[0].message.content);
    console.log('   Modèle utilisé: ' + response.data.model);
    console.log('   Tokens utilisés: ' + response.data.usage.total_tokens + '\n');

    console.log('✅✅✅ Tous les tests sont passés !');
    console.log('💡 Vous pouvez maintenant exécuter: node scripts/setup-openai-model.js\n');

  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:\n');
    
    if (error.response) {
      // Erreur de l'API OpenAI
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        console.error('❌ Erreur 401: Clé API invalide ou expirée');
        console.log('💡 Vérifiez votre clé API sur https://platform.openai.com/api-keys');
        console.log('💡 Assurez-vous que la clé est correcte et active\n');
      } else if (status === 429) {
        console.error('❌ Erreur 429: Limite de taux dépassée');
        console.log('💡 Vous avez dépassé votre quota. Vérifiez vos crédits sur https://platform.openai.com/account/usage\n');
      } else if (status === 500) {
        console.error('❌ Erreur 500: Problème côté serveur OpenAI');
        console.log('💡 Réessayez dans quelques instants\n');
      } else {
        console.error(`❌ Erreur ${status}:`, data.error?.message || data);
      }
    } else if (error.request) {
      console.error('❌ Aucune réponse du serveur OpenAI');
      console.log('💡 Vérifiez votre connexion internet\n');
    } else {
      console.error('❌ Erreur:', error.message);
    }

    process.exit(1);
  }
}

// Exécuter le test
testOpenAI();


/**
 * Service pour gérer les modèles ML locaux (Ollama, etc.)
 * Permet d'utiliser des modèles ML sans dépendre d'OpenAI
 */

const axios = require('axios');
const Habit = require('../models/Habit');
const User = require('../models/User');
const HabitAnalysisService = require('./habitAnalysisService');

class LocalMLService {
  /**
   * Génère une réponse en utilisant un modèle ML local
   * @param {String} userMessage - Message de l'utilisateur
   * @param {String} userId - ID de l'utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {Object} context - Contexte supplémentaire
   * @param {String} modelId - ID du modèle à utiliser (optionnel, par défaut: phi)
   * @returns {Promise<String>} - Réponse du modèle ML
   */
  static async generateResponse(userMessage, userId, conversationHistory = [], context = {}, modelId = 'phi:latest') {
    try {
      // Enrichir le contexte avec les données utilisateur
      const enrichedContext = await this.enrichContext(userId, context);
      
      // Construire le prompt avec le contexte
      const systemPrompt = this.buildSystemPrompt(enrichedContext);
      
      // Construire les messages pour le modèle
      const messages = this.buildMessages(systemPrompt, userMessage, conversationHistory);
      
      // Appeler le modèle ML local avec le modelId spécifié
      const response = await this.callLocalModel(messages, modelId);
      
      return response;
    } catch (error) {
      console.error('Error generating local ML response:', error);
      throw error;
    }
  }

  /**
   * Appelle un modèle ML local via Ollama
   */
  static async callLocalModel(messages, modelName = 'llama3') {
    const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';
    
    try {
      const response = await axios.post(
        `${endpoint}/api/chat`,
        {
          model: modelName,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        },
        {
          timeout: 180000 // 3 minutes pour les modèles locaux (premier chargement peut être lent)
        }
      );

      return response.data.message.content.trim();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Modèle ML local non disponible. Assurez-vous qu\'Ollama est démarré. Installez-le sur https://ollama.ai');
      }
      if (error.response?.status === 404) {
        const errorMsg = error.response?.data?.error || 'Modèle non trouvé';
        throw new Error(`Modèle "${modelName}" non trouvé dans Ollama. Téléchargez-le via l'interface Ollama. Modèles rapides recommandés: phi (1.6 GB), gemma2:2b (1.4 GB), mistral (4.1 GB)`);
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error(`Timeout: Le modèle "${modelName}" est trop lent. Utilisez un modèle plus léger. Configurez "phi" (très rapide, 1.6 GB) avec: node scripts/setup-local-ml-fast.js phi`);
      }
      throw error;
    }
  }

  /**
   * Enrichit le contexte avec les données utilisateur
   */
  static async enrichContext(userId, baseContext = {}) {
    try {
      const user = await User.findById(userId).select('-password');
      const habits = await Habit.find({ user: userId }).sort({ date: -1 }).limit(10);
      const analysis = await HabitAnalysisService.analyzeUserHabits(userId);

      return {
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          isAdmin: user?.isAdmin
        },
        habits: habits.map(h => ({
          name: h.name,
          category: h.category,
          value: h.value,
          unit: h.unit,
          date: h.date
        })),
        analysis: {
          totalHabits: analysis.totalHabits,
          score: analysis.score,
          insights: analysis.insights,
          recommendations: analysis.recommendations
        },
        ...baseContext
      };
    } catch (error) {
      console.error('Error enriching context:', error);
      return baseContext;
    }
  }

  /**
   * Construit le prompt système avec le contexte
   */
  static buildSystemPrompt(context) {
    let prompt = `Tu es un assistant IA spécialisé dans le suivi et l'amélioration des habitudes de vie. Tu donnes des conseils personnalisés, encourageants et pratiques pour aider les utilisateurs à améliorer leur bien-être.`;

    // Ajouter les informations sur l'utilisateur
    if (context.user) {
      prompt += `\n\nUtilisateur: ${context.user.firstName || ''} ${context.user.lastName || ''}`;
      if (context.user.isAdmin) {
        prompt += ' (Administrateur)';
      }
    }

    // Ajouter les habitudes récentes
    if (context.habits && context.habits.length > 0) {
      prompt += `\n\nHabitudes récentes de l'utilisateur:`;
      context.habits.slice(0, 10).forEach(habit => {
        prompt += `\n- ${habit.name} (${habit.category}): ${habit.value} ${habit.unit}`;
      });
    }

    // Ajouter l'analyse
    if (context.analysis) {
      prompt += `\n\nStatistiques:`;
      prompt += `\n- Total d'habitudes: ${context.analysis.totalHabits}`;
      prompt += `\n- Score global: ${context.analysis.score}/100`;
      
      if (context.analysis.insights && context.analysis.insights.length > 0) {
        prompt += `\n\nInsights:`;
        context.analysis.insights.forEach(insight => {
          prompt += `\n- ${insight.title}: ${insight.message}`;
        });
      }
    }

    // Instructions spécifiques
    if (context.isWelcomeMessage) {
      prompt += '\n\nIMPORTANT: Tu génères un message d\'accueil. Sois chaleureux, naturel et concis (2-3 phrases maximum).';
    }

    if (context.triggerHabit) {
      prompt += `\n\nL'utilisateur vient d'ajouter une habitude "${context.triggerHabit.name}" (${context.triggerHabit.category}). Utilise cette information pour personnaliser ta réponse.`;
    }

    prompt += '\n\nRéponds toujours en français, sois encourageant, naturel et fournis des conseils pratiques personnalisés basés sur les données réelles de l\'utilisateur.';
    
    return prompt;
  }

  /**
   * Construit les messages pour le modèle
   */
  static buildMessages(systemPrompt, userMessage, conversationHistory) {
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Ajouter l'historique de conversation
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Ajouter le message actuel
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * Vérifie si le modèle ML local est disponible
   */
  static async checkLocalModelAvailability(modelName = 'llama3') {
    const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';
    
    try {
      const response = await axios.get(`${endpoint}/api/tags`, {
        timeout: 5000
      });
      
      const availableModels = response.data.models || [];
      const modelExists = availableModels.some(model => model.name.includes(modelName));
      
      return {
        available: true,
        modelExists: modelExists,
        models: availableModels.map(m => m.name)
      };
    } catch (error) {
      return {
        available: false,
        modelExists: false,
        models: [],
        error: error.message
      };
    }
  }

  /**
   * Télécharge un modèle ML local (Ollama)
   */
  static async pullModel(modelName = 'llama3') {
    const endpoint = process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';
    
    try {
      console.log(`📥 Téléchargement du modèle ${modelName}...`);
      const response = await axios.post(
        `${endpoint}/api/pull`,
        {
          name: modelName,
          stream: false
        },
        {
          timeout: 300000 // 5 minutes pour le téléchargement
        }
      );
      
      console.log(`✅ Modèle ${modelName} téléchargé avec succès`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur lors du téléchargement du modèle ${modelName}:`, error);
      throw error;
    }
  }
}

module.exports = LocalMLService;


const axios = require('axios');
const AIModel = require('../models/AIModel');
const Habit = require('../models/Habit');
const User = require('../models/User');
const LocalMLService = require('./localMLService');
const HabitAnalysisService = require('./habitAnalysisService');

class AIService {
  /**
   * Génère une réponse IA basée sur le message de l'utilisateur et le contexte
   * @param {String} userMessage - Message de l'utilisateur
   * @param {String} userId - ID de l'utilisateur
   * @param {Array} conversationHistory - Historique de la conversation
   * @param {Object} context - Contexte supplémentaire (habits, stats, etc.)
   * @returns {Promise<String>} - Réponse de l'IA
   */
  static async generateResponse(userMessage, userId, conversationHistory = [], context = {}) {
    try {
      // Récupérer le modèle IA actif par défaut
      let aiModel = await AIModel.findOne({ isActive: true, isDefault: true });
      
      if (!aiModel) {
        throw new Error('Aucun modèle IA actif trouvé. Veuillez configurer un modèle ML local avec: node scripts/setup-local-ml.js');
      }

      // Construire le contexte enrichi
      const enrichedContext = await this.enrichContext(userId, context);

      // Router vers le bon service selon le provider
      let response;
      
      if (aiModel.provider === 'local') {
        // Utiliser le modèle ML local (Ollama)
        console.log(`🤖 Utilisation du modèle ML local: ${aiModel.modelId}`);
        try {
          response = await LocalMLService.generateResponse(
            userMessage,
            userId,
            conversationHistory,
            enrichedContext,
            aiModel.modelId // Passer le modelId du modèle configuré
          );
        } catch (localError) {
          console.error('Erreur lors de l\'appel au modèle ML local:', localError);
          throw new Error(localError.message || 'Erreur lors de l\'appel au modèle ML local. Vérifiez qu\'Ollama est démarré.');
        }
      } else if (aiModel.provider === 'openai') {
        // Utiliser OpenAI
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY n\'est pas configurée dans les variables d\'environnement');
        }
        
        try {
          response = await this.callOpenAI(aiModel, userMessage, conversationHistory, enrichedContext);
        } catch (openaiError) {
          console.error('Erreur lors de l\'appel OpenAI:', openaiError);
          
          // Gérer l'erreur de quota insuffisant en premier
          if (openaiError.response?.data?.error?.code === 'insufficient_quota' || 
              openaiError.response?.data?.error?.type === 'insufficient_quota') {
            throw new Error('Quota OpenAI insuffisant. Vous avez épuisé vos crédits. Ajoutez des crédits sur https://platform.openai.com/account/billing');
          }
          
          // Si l'erreur est liée à la clé API ou au modèle
          if (openaiError.response?.status === 401 || openaiError.response?.status === 403) {
            throw new Error('Clé API OpenAI invalide ou expirée. Veuillez vérifier votre clé API sur https://platform.openai.com/api-keys');
          }
          
          if (openaiError.response?.status === 404) {
            throw new Error('Modèle OpenAI non trouvé. Vérifiez que le modelId est correct. Modèles disponibles: gpt-4o, gpt-4-turbo, gpt-3.5-turbo');
          }
          
          // Pour les autres erreurs, utiliser le message de l'erreur
          const errorMessage = openaiError.message || 'Erreur lors de l\'appel à OpenAI';
          throw new Error(errorMessage);
        }
      } else {
        throw new Error(`Provider non supporté: ${aiModel.provider}. Utilisez 'local' pour le modèle ML local.`);
      }

      // Mettre à jour les statistiques du modèle
      if (aiModel && aiModel._id) {
        await AIModel.findByIdAndUpdate(aiModel._id, {
          $inc: { usageCount: 1 },
          lastUsed: new Date()
        });
      }

      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Ne pas utiliser de fallback - relancer l'erreur pour que l'utilisateur sache qu'il y a un problème
      throw error;
    }
  }

  /**
   * Enrichit le contexte avec les données de l'utilisateur
   */
  static async enrichContext(userId, baseContext = {}) {
    try {
      const user = await User.findById(userId).select('-password');
      const habits = await Habit.find({ user: userId }).sort({ date: -1 }).limit(50);
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
   * Appelle l'API OpenAI (ChatGPT)
   */
  static async callOpenAI(aiModel, userMessage, conversationHistory, context) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OPENAI_API_KEY n\'est pas configurée. Veuillez ajouter votre clé API OpenAI dans le fichier .env du dossier backend. Obtenez votre clé sur https://platform.openai.com/api-keys');
    }

    // Construire le prompt système avec le contexte enrichi
    const systemPrompt = this.buildSystemPrompt(aiModel, context);

    // Construire les messages pour l'API OpenAI
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Ajouter l'historique de conversation (limité aux 10 derniers messages pour éviter de dépasser les limites)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Ajouter le message actuel de l'utilisateur
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log(`📤 Appel OpenAI avec le modèle ${aiModel.modelId}`);
    console.log(`📝 Messages: ${messages.length} (${recentHistory.length} d'historique)`);

    // Fonction pour faire l'appel avec retry en cas d'erreur 429
    const makeRequestWithRetry = async (retries = 3, delay = 5000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: aiModel.modelId || 'gpt-4o',
              messages: messages,
              temperature: aiModel.config?.temperature || 0.7,
              max_tokens: aiModel.config?.maxTokens || 1000,
              top_p: aiModel.config?.topP || 1.0,
              frequency_penalty: aiModel.config?.frequencyPenalty || 0,
              presence_penalty: aiModel.config?.presencePenalty || 0
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 secondes de timeout
            }
          );

          const aiResponse = response.data.choices[0].message.content.trim();
          console.log(`✅ Réponse OpenAI reçue (${aiResponse.length} caractères)`);
          
          return aiResponse;
        } catch (error) {
          // Si c'est une erreur 429 (rate limit) et qu'il reste des tentatives, attendre et réessayer
          if (error.response?.status === 429 && i < retries - 1) {
            const retryAfter = error.response.headers['retry-after'] || delay / 1000;
            console.warn(`⚠️  Rate limit atteint. Attente de ${retryAfter} secondes avant de réessayer... (tentative ${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue;
          }
          
          // Pour les autres erreurs ou si on a épuisé les tentatives, relancer l'erreur
          console.error('❌ Erreur OpenAI:', error.response?.data || error.message);
          throw error;
        }
      }
    };

    try {
      return await makeRequestWithRetry();
    } catch (error) {
      // Gérer les erreurs spécifiques avec messages clairs
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? `${retryAfter} secondes` : 'quelques minutes';
        throw new Error(`Limite de taux OpenAI dépassée. Veuillez attendre ${waitTime} avant de réessayer. Vérifiez vos crédits sur https://platform.openai.com/account/usage`);
      }
      
      // Gérer l'erreur de quota insuffisant
      if (error.response?.data?.error?.code === 'insufficient_quota' || 
          error.response?.data?.error?.type === 'insufficient_quota') {
        throw new Error('Quota OpenAI insuffisant. Vous avez épuisé vos crédits. Ajoutez des crédits sur https://platform.openai.com/account/billing');
      }
      
      // Gérer les autres erreurs
      if (error.response?.data?.error?.message) {
        throw new Error(`Erreur OpenAI: ${error.response.data.error.message}`);
      }
      
      throw error;
    }
  }

  /**
   * Appelle l'API Anthropic (Claude)
   */
  static async callAnthropic(aiModel, userMessage, conversationHistory, context) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Construire le prompt pour Claude
    const systemPrompt = this.buildSystemPrompt(aiModel, context);
    const conversationText = conversationHistory.slice(-10)
      .map(msg => `${msg.sender === 'user' ? 'Human' : 'Assistant'}: ${msg.text}`)
      .join('\n');

    const prompt = `${systemPrompt}\n\n${conversationText}\n\nHuman: ${userMessage}\n\nAssistant:`;

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: aiModel.modelId,
        max_tokens: aiModel.config.maxTokens,
        temperature: aiModel.config.temperature,
        system: systemPrompt,
        messages: [
          ...conversationHistory.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          {
            role: 'user',
            content: userMessage
          }
        ]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.content[0].text.trim();
  }

  /**
   * Appelle un modèle local (ex: Ollama, LM Studio)
   */
  static async callLocalModel(aiModel, userMessage, conversationHistory, context) {
    const endpoint = aiModel.apiEndpoint || process.env.LOCAL_AI_ENDPOINT || 'http://localhost:11434';
    
    const messages = [
      {
        role: 'system',
        content: this.buildSystemPrompt(aiModel, context)
      },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    const response = await axios.post(
      `${endpoint}/api/chat`,
      {
        model: aiModel.modelId,
        messages: messages,
        stream: false,
        options: {
          temperature: aiModel.config.temperature
        }
      }
    );

    return response.data.message.content.trim();
  }

  /**
   * Appelle une API personnalisée
   */
  static async callCustomAPI(aiModel, userMessage, conversationHistory, context) {
    const endpoint = aiModel.apiEndpoint;
    const apiKey = process.env.CUSTOM_AI_API_KEY;

    if (!endpoint) {
      throw new Error('Custom API endpoint not configured');
    }

    const response = await axios.post(
      endpoint,
      {
        model: aiModel.modelId,
        message: userMessage,
        conversation: conversationHistory,
        context: context,
        config: aiModel.config
      },
      {
        headers: {
          'Authorization': apiKey ? `Bearer ${apiKey}` : undefined,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.response || response.data.message || response.data;
  }

  /**
   * Construit le prompt système avec le contexte
   */
  static buildSystemPrompt(aiModel, context) {
    let prompt = aiModel.systemPrompt || '';

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

    // Ajouter des instructions spécifiques pour le message d'accueil
    if (context.isWelcomeMessage) {
      prompt += '\n\nIMPORTANT: Tu génères un message d\'accueil. Sois chaleureux, naturel et concis (2-3 phrases maximum).';
    }

    // Ajouter des instructions pour les réponses normales
    if (context.triggerHabit) {
      prompt += `\n\nL'utilisateur vient d'ajouter une habitude "${context.triggerHabit.name}" (${context.triggerHabit.category}). Utilise cette information pour personnaliser ta réponse.`;
    }

    prompt += '\n\nRépondez toujours en français, soyez encourageant, naturel et fournissez des conseils pratiques personnalisés basés sur les données réelles de l\'utilisateur.';
    
    return prompt;
  }

  /**
   * Génère une réponse de fallback intelligente basée sur le contexte réel
   * NOTE: Cette fonction n'est plus utilisée - toutes les réponses passent par OpenAI
   * Conservée uniquement pour référence historique
   */
  static async generateFallbackResponse(userMessage, userId, context) {
    try {
      // Essayer d'enrichir le contexte même pour le fallback
      const enrichedContext = await this.enrichContext(userId, context);
      
      // Construire une réponse contextuelle basée sur les vraies données
      let response = '';
      const message = userMessage.toLowerCase();

      // Analyser les habitudes réelles de l'utilisateur
      if (enrichedContext.habits && enrichedContext.habits.length > 0) {
        const habitsByCategory = {};
        enrichedContext.habits.forEach(habit => {
          if (!habitsByCategory[habit.category]) {
            habitsByCategory[habit.category] = [];
          }
          habitsByCategory[habit.category].push(habit);
        });

        // Réponses personnalisées basées sur les habitudes réelles
        if (message.includes('sommeil') || message.includes('dormir') || message.includes('sleep')) {
          const sleepHabits = habitsByCategory['sleep'] || [];
          if (sleepHabits.length > 0) {
            const avgValue = sleepHabits.reduce((sum, h) => sum + h.value, 0) / sleepHabits.length;
            response = `Je vois que vous suivez ${sleepHabits.length} habitude(s) liée(s) au sommeil. `;
            response += `Votre moyenne de sommeil est de ${avgValue.toFixed(1)} ${sleepHabits[0].unit}. `;
            response += `Pour améliorer votre sommeil, essayez de maintenir un horaire régulier, évitez les écrans avant de vous coucher, et créez un environnement confortable. `;
            response += `Voulez-vous des conseils plus spécifiques basés sur vos données ?`;
          } else {
            response = `Je remarque que vous n'avez pas encore d'habitudes liées au sommeil. `;
            response += `Le sommeil est crucial pour votre santé. Voulez-vous que je vous aide à créer une habitude de sommeil ?`;
          }
          return response;
        }

        if (message.includes('exercice') || message.includes('sport') || message.includes('exercise')) {
          const exerciseHabits = habitsByCategory['exercise'] || [];
          if (exerciseHabits.length > 0) {
            response = `Excellent ! Vous suivez ${exerciseHabits.length} habitude(s) d'exercice. `;
            response += `L'exercice régulier est excellent pour votre santé. `;
            response += `Voulez-vous des suggestions pour optimiser votre routine d'exercice actuelle ?`;
          } else {
            response = `Je remarque que vous n'avez pas encore d'habitudes d'exercice. `;
            response += `L'exercice régulier est excellent pour votre santé. Voulez-vous que je vous aide à commencer ?`;
          }
          return response;
        }

        if (message.includes('nutrition') || message.includes('manger') || message.includes('alimentation')) {
          const nutritionHabits = habitsByCategory['nutrition'] || [];
          if (nutritionHabits.length > 0) {
            response = `Je vois que vous suivez ${nutritionHabits.length} habitude(s) nutritionnelle(s). `;
            response += `Une alimentation équilibrée est essentielle. `;
            response += `Souhaitez-vous des conseils pour améliorer votre alimentation actuelle ?`;
          } else {
            response = `Je remarque que vous n'avez pas encore d'habitudes nutritionnelles. `;
            response += `Une bonne nutrition est essentielle. Voulez-vous que je vous aide à créer des habitudes alimentaires saines ?`;
          }
          return response;
        }

        // Réponse basée sur les statistiques réelles
        if (message.includes('statistiques') || message.includes('stats') || message.includes('analyse')) {
          if (enrichedContext.analysis) {
            response = `Voici vos statistiques personnelles :\n\n`;
            response += `📊 Total d'habitudes : ${enrichedContext.analysis.totalHabits}\n`;
            response += `⭐ Score global : ${enrichedContext.analysis.score}/100\n`;
            response += `🔥 Série moyenne : ${enrichedContext.analysis.averageStreak} jours\n`;
            response += `🏆 Plus longue série : ${enrichedContext.analysis.longestStreak} jours\n\n`;
            
            if (enrichedContext.analysis.insights && enrichedContext.analysis.insights.length > 0) {
              response += `💡 Insights :\n`;
              enrichedContext.analysis.insights.forEach(insight => {
                response += `- ${insight.title}: ${insight.message}\n`;
              });
            }
            
            response += `\nVoulez-vous des conseils personnalisés pour améliorer vos habitudes ?`;
          } else {
            response = `Je n'ai pas encore assez de données pour générer des statistiques. `;
            response += `Continuez à enregistrer vos habitudes pour obtenir des analyses détaillées !`;
          }
          return response;
        }

        // Réponse générale avec contexte réel
        if (Object.keys(habitsByCategory).length > 0) {
          response = `Je vois que vous suivez ${enrichedContext.habits.length} habitude(s) dans ${Object.keys(habitsByCategory).length} catégorie(s). `;
          response += `Vos catégories principales sont : ${Object.keys(habitsByCategory).join(', ')}. `;
          response += `Comment puis-je vous aider aujourd'hui ? Vous pouvez me demander des conseils, des analyses, ou des recommandations.`;
        } else {
          response = `Je suis là pour vous aider avec vos habitudes. `;
          response += `Vous pouvez me demander des conseils sur le sommeil, l'exercice, la nutrition, ou toute autre catégorie. `;
          response += `Tapez 'aide' pour voir toutes les options disponibles.`;
        }
      } else {
        // Pas encore d'habitudes
        response = `Bonjour ! Je suis votre assistant IA Reversee. `;
        response += `Je remarque que vous n'avez pas encore enregistré d'habitudes. `;
        response += `Je peux vous aider à créer des habitudes saines et vous donner des conseils personnalisés. `;
        response += `Comment puis-je vous aider à commencer ?`;
      }

      return response;
    } catch (error) {
      console.error('Error in fallback response generation:', error);
      // Dernier recours : réponse très simple
      return "Je suis là pour vous aider avec vos habitudes. Comment puis-je vous aider aujourd'hui ?";
    }
  }

  /**
   * Crée un modèle IA par défaut (ML local uniquement)
   * Note: OpenAI a été désactivé. Utilisez setup-local-ml.js pour configurer le modèle local.
   */
  static async createDefaultModel() {
    try {
      // Vérifier si un modèle local existe
      const existingDefault = await AIModel.findOne({ isDefault: true, provider: 'local' });
      if (existingDefault) {
        return existingDefault;
      }

      throw new Error('Aucun modèle ML local configuré. Exécutez: node scripts/setup-local-ml.js');
    } catch (error) {
      console.error('Error creating default AI model:', error);
      throw error;
    }
  }
}

module.exports = AIService;


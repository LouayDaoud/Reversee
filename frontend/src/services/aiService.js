/**
 * Service pour gérer les appels API IA
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AIService {
  /**
   * Génère une réponse IA
   * @param {string} message - Message de l'utilisateur
   * @param {string} token - Token d'authentification
   * @param {string} conversationId - ID de la conversation (optionnel)
   * @param {object} context - Contexte supplémentaire (optionnel)
   * @returns {Promise<object>} Réponse de l'IA
   */
  static async generateResponse(message, token, conversationId = null, context = {}) {
    try {
      const response = await axios.post(
        `${API_URL}/ai/generate`,
        {
          message,
          conversationId,
          context
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  /**
   * Génère une réponse IA pour une conversation existante
   * @param {string} conversationId - ID de la conversation
   * @param {string} message - Message de l'utilisateur
   * @param {string} token - Token d'authentification
   * @returns {Promise<object>} Réponse de l'IA avec la conversation mise à jour
   */
  static async generateConversationResponse(conversationId, message, token) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/${conversationId}/ai-response`,
        {
          message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error generating conversation AI response:', error);
      throw error;
    }
  }

  /**
   * Obtient le modèle IA actif
   * @param {string} token - Token d'authentification
   * @returns {Promise<object>} Modèle IA actif
   */
  static async getActiveModel(token) {
    try {
      const response = await axios.get(`${API_URL}/ai/model/active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting active AI model:', error);
      throw error;
    }
  }

  /**
   * Crée une nouvelle conversation
   * @param {string} token - Token d'authentification
   * @param {string} triggerHabitId - ID de l'habitude qui a déclenché la conversation (optionnel)
   * @returns {Promise<object>} Nouvelle conversation
   */
  static async createConversation(token, triggerHabitId = null) {
    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        {
          triggerHabitId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Ajoute un message à une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} text - Texte du message
   * @param {string} sender - Expéditeur ('user' ou 'ai')
   * @param {string} token - Token d'authentification
   * @returns {Promise<object>} Conversation mise à jour
   */
  static async addMessage(conversationId, text, sender, token) {
    try {
      const response = await axios.post(
        `${API_URL}/chat/${conversationId}/messages`,
        {
          text,
          sender
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  }

  /**
   * Obtient toutes les conversations de l'utilisateur
   * @param {string} token - Token d'authentification
   * @returns {Promise<object>} Liste des conversations
   */
  static async getUserConversations(token) {
    try {
      const response = await axios.get(`${API_URL}/chat/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }
}

export default AIService;




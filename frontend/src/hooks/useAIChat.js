/**
 * Hook personnalisé pour gérer le chat IA
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import AIService from '../services/aiService';

export const useAIChat = (token, user, triggerHabit = null) => {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Initialise la conversation
   */
  const initializeChat = useCallback(async () => {
    if (!token || isInitialized) return;

    setIsTyping(true);
    setError(null);

    try {
      // Créer une nouvelle conversation
      const conversationRes = await AIService.createConversation(
        token,
        triggerHabit?._id
      );

      const newConversationId = conversationRes.data._id;
      setConversationId(newConversationId);

      // Générer un message d'accueil personnalisé avec l'IA
      let welcomePrompt = `Bonjour ${user?.firstName || 'là'} ! Je suis votre assistant IA Reversee. `;

      if (triggerHabit) {
        welcomePrompt += `L'utilisateur vient d'ajouter une habitude "${triggerHabit.name}" dans la catégorie "${triggerHabit.category}". `;
        welcomePrompt += `Génère un message d'accueil chaleureux et personnalisé qui mentionne cette nouvelle habitude et propose ton aide de manière naturelle et encourageante. Sois bref (2-3 phrases maximum).`;
      } else {
        welcomePrompt += `Génère un message d'accueil chaleureux et personnalisé pour l'utilisateur. Présente-toi brièvement et explique comment tu peux l'aider avec ses habitudes. Sois encourageant et naturel. Maximum 3 phrases.`;
      }

      try {
        // Générer le message d'accueil avec l'IA via l'endpoint backend
        const welcomeResponse = await AIService.generateResponse(
          welcomePrompt,
          token,
          null, // Pas de conversationId pour le message d'accueil
          {
            triggerHabit: triggerHabit,
            isWelcomeMessage: true
          }
        );

        // Extraire la réponse de la structure de l'API
        const welcomeMessage = welcomeResponse.data?.response || welcomeResponse.response || 'Bonjour ! Je suis votre assistant IA Reversee. Comment puis-je vous aider ?';
        
        // Ajouter le message d'accueil
        setMessages([{ text: welcomeMessage, sender: 'ai' }]);
        
        // Sauvegarder le message d'accueil
        await AIService.addMessage(newConversationId, welcomeMessage, 'ai', token);
      } catch (err) {
        console.error('Error generating welcome message with AI:', err);
        // Pas de fallback - afficher l'erreur pour que l'utilisateur sache qu'il y a un problème
        setError('Erreur lors de la génération du message d\'accueil. Vérifiez que le modèle ML local est correctement configuré.');
        setMessages([{
          text: 'Erreur: Impossible de se connecter à l\'assistant IA. Veuillez vérifier que le modèle ML local (Ollama) est configuré.',
          sender: 'ai'
        }]);
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError('Erreur lors de l\'initialisation du chat. Vérifiez que le modèle ML local est correctement configuré.');
      setMessages([{
        text: 'Erreur: Impossible d\'initialiser le chat. Veuillez vérifier que le modèle ML local (Ollama) est installé et démarré.',
        sender: 'ai'
      }]);
      setIsInitialized(true);
    } finally {
      setIsTyping(false);
    }
  }, [token, user, triggerHabit, isInitialized]);

  /**
   * Envoie un message et obtient une réponse IA
   */
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !token) return;

    const userMessage = messageText.trim();
    
    // Ajouter le message utilisateur à l'UI immédiatement
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsTyping(true);
    setError(null);

    try {
      // Si on a une conversation, utiliser l'endpoint de conversation
      if (conversationId) {
        const response = await AIService.generateConversationResponse(
          conversationId,
          userMessage,
          token
        );

        // La réponse contient déjà la conversation mise à jour avec les messages
        const updatedConversation = response.data.conversation;
        const aiResponse = response.data.response;

        // Mettre à jour les messages depuis la conversation
        setMessages(updatedConversation.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender
        })));
      } else {
        // Sinon, utiliser l'endpoint générique
        const response = await AIService.generateResponse(
          userMessage,
          token,
          conversationId,
          {}
        );

        const aiResponse = response.data.response;

        // Ajouter la réponse IA
        setMessages(prev => [...prev, { text: aiResponse, sender: 'ai' }]);

        // Sauvegarder les messages si on a une conversation
        if (conversationId) {
          await AIService.addMessage(conversationId, userMessage, 'user', token);
          await AIService.addMessage(conversationId, aiResponse, 'ai', token);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Messages d'erreur plus clairs
      let errorMessage = "Désolé, j'ai rencontré un problème.";
      
      if (err.response?.data?.message) {
        const backendError = err.response.data.message;
        if (backendError.includes('Ollama') || backendError.includes('ML local') || backendError.includes('modèle ML')) {
          errorMessage = backendError;
          setError('Configuration du modèle ML local');
        } else {
          errorMessage = backendError;
          setError(backendError);
        }
      } else {
        setError('Erreur lors de l\'envoi du message. Veuillez réessayer.');
      }
      
      setMessages(prev => [...prev, { text: errorMessage, sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  }, [token, conversationId]);

  /**
   * Réinitialise la conversation
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setIsInitialized(false);
    setError(null);
  }, []);

  return {
    messages,
    conversationId,
    isTyping,
    error,
    isInitialized,
    messagesEndRef,
    initializeChat,
    sendMessage,
    resetChat
  };
};


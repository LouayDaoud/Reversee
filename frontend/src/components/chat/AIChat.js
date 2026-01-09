import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import ThemeContext from '../../context/ThemeContext';
import AuthContext from '../../context/AuthContext';
import { useAIChat } from '../../hooks/useAIChat';

const AIChat = ({ onClose, triggerHabit = null }) => {
  const { theme } = useContext(ThemeContext);
  const { user, token } = useContext(AuthContext);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  // Utiliser le hook personnalisé pour gérer le chat IA
  const {
    messages,
    isTyping,
    error,
    messagesEndRef,
    initializeChat,
    sendMessage
  } = useAIChat(token, user, triggerHabit);

  // Initialiser le chat au montage du composant
  useEffect(() => {
    if (token && user) {
      initializeChat();
    }
  }, [token, user, initializeChat]);

  // Gérer l'envoi de message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isTyping) return;

    const messageText = input;
    setInput('');
    await sendMessage(messageText);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${isMinimized ? 'bottom-4 right-4 w-auto h-auto' : 'bottom-0 right-0 w-full md:w-96 h-[500px]'}
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg rounded-t-lg md:rounded-lg overflow-hidden z-50 transition-colors duration-200`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Chat header */}
        <div className={`flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-600'} text-white transition-colors duration-200`}>
          <h3 className="font-medium">Assistant IA Reversee</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-full hover:bg-opacity-20 hover:bg-white transition-colors"
              aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
            >
              {isMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-opacity-20 hover:bg-white transition-colors"
              aria-label="Fermer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Chat messages */}
            <div className={`flex-1 p-4 overflow-y-auto h-[380px] ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}>
              {error && (
                <div className={`mb-4 p-3 rounded-lg ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'} text-sm`}>
                  {error}
                </div>
              )}

              {messages.length === 0 && !isTyping && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Initialisation du chat...</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.sender === 'user'
                        ? theme === 'dark' ? 'bg-indigo-700 text-white' : 'bg-indigo-600 text-white'
                        : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'
                    } shadow transition-colors duration-200`}
                  >
                    {message.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="text-left mb-4">
                  <div className={`inline-block p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} shadow transition-colors duration-200`}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} transition-colors duration-200`}>
              <form
                onSubmit={handleSendMessage}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  disabled={isTyping}
                  className={`flex-1 p-2 rounded-md border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50`}
                />
                <button
                  type="submit"
                  disabled={isTyping || input.trim() === ''}
                  className={`p-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-indigo-700 hover:bg-indigo-600'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label="Envoyer le message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChat;

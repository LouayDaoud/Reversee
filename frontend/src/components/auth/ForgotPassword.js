import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ThemeContext from '../../context/ThemeContext';

const ForgotPassword = () => {
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    console.log('Submitting forgot password form with email:', email);

    try {
      console.log('Sending request to:', `${API_URL}/auth/forgotpassword`);
      const res = await axios.post(`${API_URL}/auth/forgotpassword`, { email });

      console.log('Response received:', res.data);
      setSuccess(res.data.message || 'Si votre email est enregistré, vous recevrez un lien de réinitialisation de mot de passe.');
      setEmail('');
    } catch (err) {
      console.error('Error in forgot password request:', err);
      console.error('Error response:', err.response);

      setError(
        err.response?.data?.message ||
        'Une erreur est survenue lors de la demande de réinitialisation du mot de passe.'
      );
    } finally {  
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <motion.div
        className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Mot de passe oublié
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">{success}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Adresse email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  theme === 'dark'
                    ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200`}
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              } transition-colors duration-200`}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/login"
                className={`font-medium ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'} transition-colors duration-200`}
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ExclamationCircleIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ThemeContext from '../../context/ThemeContext';
import AuthContext from '../../context/AuthContext';

const ResetPassword = () => {
  const { theme } = useContext(ThemeContext);
  const { login } = useContext(AuthContext);
  const { resettoken } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.put(
        `${API_URL}/auth/resetpassword/${resettoken}`,
        { password }
      );
      
      setSuccess('Votre mot de passe a été réinitialisé avec succès');
      
      // If token is returned, log the user in
      if (res.data.token) {
        setTimeout(() => {
          login(res.data.token);
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la réinitialisation du mot de passe'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            Réinitialiser votre mot de passe
          </h2>
          <p className={`mt-2 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
            Entrez votre nouveau mot de passe
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
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                    theme === 'dark' 
                      ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200`}
                  placeholder="Nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeSlashIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <EyeIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  theme === 'dark' 
                    ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200`}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isSubmitting ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
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

export default ResetPassword;

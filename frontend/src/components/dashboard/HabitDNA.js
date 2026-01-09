import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import habitDNAService from '../../services/habitDNAService';
import {
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  SparklesIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const HabitDNA = ({ onClose }) => {
  const { theme } = useContext(ThemeContext);
  const [habitDNA, setHabitDNA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchHabitDNA();
  }, []);

  const fetchHabitDNA = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await habitDNAService.getMyHabitDNA();
      if (response.success && response.data) {
        setHabitDNA(response.data);
      } else {
        setError('Impossible de charger le Habit DNA. Veuillez réessayer.');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Habit DNA:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement du Habit DNA';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const response = await habitDNAService.updateHabitDNA();
      if (response.success) {
        setHabitDNA(response.data);
      }
      setRegenerating(false);
    } catch (err) {
      console.error('Error regenerating Habit DNA:', err);
      setError(err.response?.data?.message || 'Erreur lors de la régénération');
      setRegenerating(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const response = await habitDNAService.toggleVisibility();
      if (response.success) {
        setHabitDNA(response.data);
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    }
  };

  const renderComponentBar = (label, value, color) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {label}
          </span>
          <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}%
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6`}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className={`mt-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Génération de votre Habit DNA...
          </p>
        </div>
      </div>
    );
  }

  if (error && !habitDNA) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md`}
        >
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <BeakerIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <div className="ml-3">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Erreur
              </h3>
            </div>
          </div>
          <div className={`mb-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchHabitDNA}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Réessayer
            </button>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-md border ${
                theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } transition-colors`}
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!habitDNA) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <SparklesIcon className={`w-8 h-8 mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mon Habit DNA
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleVisibility}
                className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title={habitDNA.isPublic ? 'Rendre privé' : 'Rendre public'}
              >
                {habitDNA.isPublic ? (
                  <EyeIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                ) : (
                  <EyeSlashIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                )}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} disabled:opacity-50`}
                title="Régénérer"
              >
                <ArrowPathIcon className={`w-5 h-5 ${regenerating ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <XMarkIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* DNA Sequence */}
          <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Séquence ADN Unique
            </h3>
            <div className="font-mono text-sm break-all p-3 bg-black text-green-400 rounded">
              {habitDNA.dnaSequence}
            </div>
          </div>

          {/* Visual Pattern */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Pattern Visuel
            </h3>
            <div className="flex h-8 rounded-lg overflow-hidden">
              {habitDNA.visualPattern && habitDNA.visualPattern.map((item, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: item.color }}
                  title={`Position ${item.position}`}
                />
              ))}
            </div>
          </div>

          {/* Components */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Composants de votre ADN
            </h3>
            {renderComponentBar('Consistance', habitDNA.components.consistency, habitDNA.colors.primary)}
            {renderComponentBar('Diversité', habitDNA.components.diversity, habitDNA.colors.secondary)}
            {renderComponentBar('Intensité', habitDNA.components.intensity, habitDNA.colors.accent)}
            {renderComponentBar('Équilibre', habitDNA.components.balance, habitDNA.colors.primary)}
            {renderComponentBar('Croissance', habitDNA.components.growth, habitDNA.colors.secondary)}
          </div>

          {/* Colors */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Couleurs de votre ADN
            </h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div
                  className="h-16 rounded-lg mb-2"
                  style={{ backgroundColor: habitDNA.colors.primary }}
                />
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Primaire: {habitDNA.colors.primary}
                </p>
              </div>
              <div className="flex-1">
                <div
                  className="h-16 rounded-lg mb-2"
                  style={{ backgroundColor: habitDNA.colors.secondary }}
                />
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Secondaire: {habitDNA.colors.secondary}
                </p>
              </div>
              <div className="flex-1">
                <div
                  className="h-16 rounded-lg mb-2"
                  style={{ backgroundColor: habitDNA.colors.accent }}
                />
                <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Accent: {habitDNA.colors.accent}
                </p>
              </div>
            </div>
          </div>

          {/* Mutations */}
          {habitDNA.mutations && habitDNA.mutations.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mutations ({habitDNA.mutations.length})
              </h3>
              <div className="space-y-2">
                {habitDNA.mutations.slice(0, 5).map((mutation, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {mutation.type === 'major_change' && 'Changement Majeur'}
                          {mutation.type === 'new_habit' && 'Nouvelle Habitude'}
                          {mutation.type === 'consistency_improvement' && 'Amélioration de Consistance'}
                          {mutation.type === 'diversity_increase' && 'Augmentation de Diversité'}
                        </p>
                        {mutation.description && (
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {mutation.description}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(mutation.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Habitudes</p>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {habitDNA.stats.totalHabits || 0}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Dernière Mise à Jour</p>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {habitDNA.stats.lastUpdated
                    ? new Date(habitDNA.stats.lastUpdated).toLocaleDateString('fr-FR')
                    : 'Jamais'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HabitDNA;


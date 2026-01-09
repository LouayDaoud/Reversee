import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import BadgeContext from '../../context/BadgeContext';
import ThemeContext from '../../context/ThemeContext';
import Badge from './Badge';

const BadgeCollection = () => {
  const { badges, userBadges, loading, error, checkForBadges, fetchUserBadges } = useContext(BadgeContext);
  const { theme } = useContext(ThemeContext);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter] = useState('all');

  // Check for new badges and refresh user badges when component mounts
  useEffect(() => {
    const refreshBadges = async () => {
      await fetchUserBadges(); // Refresh user badges first
      await checkForBadges(); // Then check for new badges
    };

    refreshBadges();
  }, []);
  
  // Filter badges based on selected filter
  const filteredBadges = () => {
    if (filter === 'earned') {
      return badges.filter(badge => 
        userBadges.some(ub => ub.badge._id === badge._id && ub.isCompleted)
      );
    } else if (filter === 'progress') {
      return badges.filter(badge => 
        userBadges.some(ub => ub.badge._id === badge._id && !ub.isCompleted && ub.progress > 0)
      );
    } else if (filter === 'locked') {
      return badges.filter(badge => 
        !userBadges.some(ub => ub.badge._id === badge._id)
      );
    } else {
      return badges;
    }
  };
  
  // Get user badge data for a badge
  const getUserBadgeData = (badgeId) => {
    const userBadge = userBadges.find(ub => ub.badge._id === badgeId);
    return userBadge || { isCompleted: false, progress: 0 };
  };
  
  // Handle badge click
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
  };
  
  // Close badge detail modal
  const closeModal = () => {
    setSelectedBadge(null);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await fetchUserBadges();
    await checkForBadges();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-800'}`}>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Filter Tabs and Refresh */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? theme === 'dark'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Tous
          </button>
        <button
          onClick={() => setFilter('earned')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'earned'
              ? theme === 'dark'
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-600 text-white'
              : theme === 'dark'
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition-colors duration-200`}
        >
          Débloqués
        </button>
        <button
          onClick={() => setFilter('progress')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'progress'
              ? theme === 'dark'
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-600 text-white'
              : theme === 'dark'
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition-colors duration-200`}
        >
          En cours
        </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'locked'
                ? theme === 'dark'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Verrouillés
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400'
          } transition-colors duration-200`}
          title="Rafraîchir les badges"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBadges().map(badge => {
          const userBadgeData = getUserBadgeData(badge._id);
          return (
            <Badge
              key={badge._id}
              badge={badge}
              earned={userBadgeData.isCompleted}
              progress={userBadgeData.progress}
              onClick={() => handleBadgeClick(badge)}
            />
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredBadges().length === 0 && (
        <div className={`p-8 text-center rounded-md ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            {filter === 'earned'
              ? "Vous n'avez pas encore débloqué de badges. Continuez à suivre vos habitudes pour en gagner !"
              : filter === 'progress'
              ? "Vous n'avez pas de badges en cours. Continuez à suivre vos habitudes pour progresser !"
              : filter === 'locked'
              ? "Tous les badges sont débloqués. Félicitations !"
              : "Aucun badge disponible pour le moment."}
          </p>
        </div>
      )}
      
      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedBadge.name}
                </h2>
                <button
                  onClick={closeModal}
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  &times;
                </button>
              </div>
              
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 mr-4 ${getUserBadgeData(selectedBadge._id).isCompleted ? `bg-${selectedBadge.color}-500 text-white` : 'bg-gray-300 text-gray-500'}`}>
                  {/* Icon would be rendered here */}
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedBadge.description}
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Niveau {selectedBadge.level}
                  </p>
                </div>
              </div>
              
              <div className={`p-4 rounded-md mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                  Comment obtenir ce badge :
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedBadge.criteria.type === 'habit_count' && `Ajoutez ${selectedBadge.criteria.value} habitudes.`}
                  {selectedBadge.criteria.type === 'streak' && `Atteignez une série de ${selectedBadge.criteria.value} jours consécutifs.`}
                  {selectedBadge.criteria.type === 'category_count' && `Ajoutez ${selectedBadge.criteria.value} habitudes dans la catégorie ${selectedBadge.criteria.category}.`}
                  {selectedBadge.criteria.type === 'days_active' && `Soyez actif pendant ${selectedBadge.criteria.value} jours.`}
                </p>
              </div>
              
              {!getUserBadgeData(selectedBadge._id).isCompleted && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Progression</span>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                      {Math.round(getUserBadgeData(selectedBadge._id).progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${getUserBadgeData(selectedBadge._id).progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <button
                onClick={closeModal}
                className={`w-full py-2 px-4 rounded-md ${
                  theme === 'dark'
                    ? 'bg-indigo-700 hover:bg-indigo-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } transition-colors duration-200`}
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeCollection;

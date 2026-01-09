import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import HabitContext from '../../context/HabitContext';
import ThemeContext from '../../context/ThemeContext';
import BadgeContext from '../../context/BadgeContext';
import HabitForm from './HabitForm';
import HabitList from './HabitList';
import StatsModal from '../stats/StatsModal';
import AIChat from '../chat/AIChat';
import BadgeCollection from '../badges/BadgeCollection';
import HabitAnalysis from '../analysis/HabitAnalysis';
import UserHabitCalendar from './UserHabitCalendar';
import HabitDNA from './HabitDNA';
import {
  ChartBarIcon,
  PlusIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  SparklesIcon,
  CalendarIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { habits, loading, getHabits } = useContext(HabitContext);
  const { theme } = useContext(ThemeContext);
  const { checkForBadges } = useContext(BadgeContext);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHabitDNA, setShowHabitDNA] = useState(false);
  const [lastAddedHabit, setLastAddedHabit] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Effet pour récupérer les habitudes
  useEffect(() => {
    const fetchHabits = async () => {
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      await getHabits(filters);
    };

    fetchHabits();
  }, [getHabits, selectedCategory, dateRange.startDate, dateRange.endDate]);

  // Effet séparé pour vérifier les badges une seule fois au chargement
  useEffect(() => {
    // Vérifier les badges une seule fois au chargement initial
    const checkBadgesOnce = async () => {
      try {
        await checkForBadges();
        console.log('Badges checked successfully');
      } catch (error) {
        console.error('Error checking badges:', error);
      }
    };

    checkBadgesOnce();
    // Pas de dépendances pour que cela ne s'exécute qu'une seule fois
  }, []);

  const handleRefresh = async () => {
    try {
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      await getHabits(filters);
      console.log('Habits refreshed successfully');
    } catch (error) {
      console.error('Error refreshing habits:', error);
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const categories = [
    { id: 'all', name: 'All Habits' },
    { id: 'sleep', name: 'Sleep' },
    { id: 'exercise', name: 'Exercise' },
    { id: 'screen', name: 'Screen Time' },
    { id: 'mood', name: 'Mood' },
    { id: 'stress', name: 'Stress' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'other', name: 'Other' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} transition-colors duration-200`}>
      <header className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} shadow transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>Welcome, {user?.firstName || 'User'}</span>
            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${theme === 'dark' ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200`}
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => setShowHabitForm(true)}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${theme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Habit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} shadow rounded-lg p-6 transition-colors duration-200`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div>
                  <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200`}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200`}
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleRefresh}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                  >
                    <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`} aria-hidden="true" />
                    Refresh
                  </button>

                  <button
                    onClick={() => setShowStatsModal(true)}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                  >
                    <ChartBarIcon className={`-ml-1 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`} aria-hidden="true" />
                    View Stats
                  </button>

                  <button
                    onClick={() => setShowBadges(true)}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                  >
                    <TrophyIcon className={`-ml-1 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`} aria-hidden="true" />
                    Mes Badges
                  </button>

                  <button
                    onClick={() => setShowAnalysis(true)}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                  >
                    <SparklesIcon className={`-ml-1 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`} aria-hidden="true" />
                    Analyse IA
                  </button>

                  <button
                    onClick={() => setShowAIChat(true)}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                  >
                    <ChatBubbleLeftRightIcon className={`-ml-1 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`} aria-hidden="true" />
                    AI Assistant
                  </button>

                  <button
                    onClick={() => setShowCalendar(true)}
                    className={`inline-flex items-center px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'} rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                  >
                    <CalendarIcon className={`-ml-1 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`} aria-hidden="true" />
                    Calendrier
                  </button>
                </div>

                {/* Section centrée pour Mon DNA */}
                <div className="flex items-center space-x-3 mx-auto">
                  <div className={`h-8 w-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  <button
                    onClick={() => setShowHabitDNA(true)}
                    className={`inline-flex items-center px-5 py-2.5 border-2 ${theme === 'dark' ? 'border-indigo-500 text-indigo-400 bg-indigo-900/30 hover:bg-indigo-900/50' : 'border-indigo-500 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'} rounded-lg shadow-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105`}
                  >
                    <BeakerIcon className={`mr-2 h-5 w-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} aria-hidden="true" />
                    Mon DNA
                  </button>
                  <div className={`h-8 w-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <HabitList habits={habits} />
            )}
          </div>
        </div>
      </main>

      {showHabitForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full mx-4 transition-colors duration-200`}
          >
            <HabitForm
              onClose={() => setShowHabitForm(false)}
              onHabitAdded={(habit) => {
                setLastAddedHabit(habit);
                setShowAIChat(true);
              }}
            />
          </motion.div>
        </div>
      )}

      {showStatsModal && (
        <StatsModal onClose={() => setShowStatsModal(false)} />
      )}

      {showAIChat && (
        <AIChat
          onClose={() => setShowAIChat(false)}
          triggerHabit={lastAddedHabit}
        />
      )}

      {showBadges && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6 transition-colors duration-200`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Mes Badges
              </h2>
              <button
                onClick={() => setShowBadges(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} text-2xl focus:outline-none`}
              >
                &times;
              </button>
            </div>
            <BadgeCollection />
          </motion.div>
        </div>
      )}

      {showAnalysis && (
        <HabitAnalysis onClose={() => setShowAnalysis(false)} />
      )}

      {showCalendar && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200`}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Calendrier des Habitudes
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} text-2xl focus:outline-none`}
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <UserHabitCalendar />
            </div>
          </motion.div>
        </div>
      )}

      {showHabitDNA && (
        <HabitDNA onClose={() => setShowHabitDNA(false)} />
      )}
    </div>
  );
};

export default Dashboard;

import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  LightBulbIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import AnalysisContext from '../../context/AnalysisContext';
import ThemeContext from '../../context/ThemeContext';

const HabitAnalysis = ({ onClose }) => {
  const { 
    analysis, 
    aiInsights, 
    recommendations, 
    loading, 
    error, 
    getCompleteAnalysis 
  } = useContext(AnalysisContext);
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    getCompleteAnalysis();
  }, []);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-8`}>
          <div className="flex items-center justify-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
            <span className={`ml-4 text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Analyse de vos habitudes en cours...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
            <SparklesIcon className="h-6 w-6 mr-2 text-indigo-500" />
            Analyse Intelligente de vos Habitudes
          </h2>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} text-2xl focus:outline-none`}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'insights', name: 'Insights IA', icon: LightBulbIcon },
              { id: 'recommendations', name: 'Recommandations', icon: TrophyIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className={`${theme === 'dark' ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-6`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && analysis && (
            <div className="space-y-6">
              {/* Score Global */}
              <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Score Global
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Basé sur votre constance et vos progrès
                    </p>
                  </div>
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${analysis.score >= 80 ? 'bg-green-500' : analysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${analysis.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analysis.totalHabits}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Habitudes totales
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analysis.completedToday}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Complétées aujourd'hui
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analysis.averageStreak}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Série moyenne
                  </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                  <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {analysis.longestStreak}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Plus longue série
                  </div>
                </div>
              </div>

              {/* Insights automatiques */}
              {analysis.insights && analysis.insights.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Insights Automatiques
                  </h3>
                  <div className="space-y-3">
                    {analysis.insights.map((insight, index) => (
                      <div
                        key={index}
                        className={`flex items-start p-4 rounded-lg ${
                          insight.type === 'success'
                            ? theme === 'dark' ? 'bg-green-900' : 'bg-green-50'
                            : insight.type === 'warning'
                            ? theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-50'
                            : theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'
                        }`}
                      >
                        {getInsightIcon(insight.type)}
                        <div className="ml-3">
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {insight.title}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {insight.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {aiInsights ? (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                  <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    Analyse IA Personnalisée
                  </h3>
                  <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
                    <div className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {aiInsights.aiInsights}
                    </div>
                  </div>
                  {aiInsights.generatedAt && (
                    <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Généré le {new Date(aiInsights.generatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 text-center`}>
                  <LightBulbIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Chargement des insights IA...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((category, index) => (
                  <div key={index} className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6`}>
                    <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {category.title}
                    </h3>
                    <div className="grid gap-4">
                      {category.habits.map((habit, habitIndex) => (
                        <div
                          key={habitIndex}
                          className={`${theme === 'dark' ? 'bg-gray-600' : 'bg-white'} rounded-lg p-4 border ${theme === 'dark' ? 'border-gray-500' : 'border-gray-200'}`}
                        >
                          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {habit.name}
                          </h4>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {habit.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-6 text-center`}>
                  <TrophyIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Chargement des recommandations...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HabitAnalysis;

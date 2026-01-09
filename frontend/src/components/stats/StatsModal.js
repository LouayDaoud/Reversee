import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

const StatsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching statistics data...');
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token found');
        
        // Fetch general stats
        console.log('About to fetch stats from API');
        const statsRes = await axios.get('http://localhost:5000/api/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Stats data received:', statsRes.data);
        
        // Fetch productivity score
        console.log('About to fetch productivity from API');
        const productivityRes = await axios.get('http://localhost:5000/api/stats/productivity', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Productivity data received:', productivityRes.data);
        
        // Fetch insights
        console.log('About to fetch insights from API');
        const insightsRes = await axios.get('http://localhost:5000/api/stats/insights', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Insights data received:', insightsRes.data);
        
        setStats(statsRes.data.data);
        setProductivity(productivityRes.data.data);
        setInsights(insightsRes.data.data);
      } catch (err) {
        console.error('Error in fetchStats:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.message || 'Error fetching statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Weekly trends chart data
  const weeklyTrendsData = {
    labels: stats?.weeklyTrends?.map(day => day.day) || [],
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: stats?.weeklyTrends?.map(day => 
          day.totalCount > 0 
            ? Math.round((day.completedCount / day.totalCount) * 100) 
            : 0
        ) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };
  
  // Category distribution chart data
  const categoryData = {
    labels: stats?.categoryDistribution ? Object.keys(stats.categoryDistribution) : [],
    datasets: [
      {
        data: stats?.categoryDistribution ? Object.values(stats.categoryDistribution) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Productivity radar chart data
  const productivityData = {
    labels: ['Completion', 'Streak', 'Consistency', 'Variety'],
    datasets: [
      {
        label: 'Score',
        data: productivity?.components 
          ? [
              productivity.components.completion,
              productivity.components.streak,
              productivity.components.consistency,
              productivity.components.variety
            ] 
          : [0, 0, 0, 0],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)'
      }
    ]
  };

  // Return loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Return error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Statistics Error</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Statistics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <nav className="flex space-x-4">
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'overview'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'productivity'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('productivity')}
              >
                Productivity
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'insights'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('insights')}
              >
                Insights
              </button>
            </nav>
          </div>
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Habits
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats?.habitCounts?.total || 0}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completion Rate
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats?.completionRate || 0}%
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Longest Streak
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats?.streakStats?.longest || 0} days
                    </dd>
                  </div>
                </div>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Weekly Trend</h3>
                  <div className="h-64">
                    <Line
                      data={weeklyTrendsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: 'Completion %'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut
                      data={categoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Recent activity */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
                  <div className="flow-root max-h-64 overflow-y-auto">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {stats?.recentActivity?.length > 0 ? (
                        stats.recentActivity.map((entry, index) => (
                          <li key={index} className="py-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                                  entry.completed ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                  <span className={`text-xs font-medium ${
                                    entry.completed ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {entry.completed ? '✓' : '✗'}
                                  </span>
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {entry.habitName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  Category: {entry.category}
                                </p>
                              </div>
                              <div className="flex-shrink-0 flex items-center text-sm text-gray-500">
                                {new Date(entry.date).toLocaleDateString()}
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="py-4 text-center text-gray-500">
                          No recent activity to display
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'productivity' && (
            <div className="space-y-6">
              {/* Productivity score */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-indigo-200 border-2">
                <div className="px-4 py-5 sm:p-6 text-center">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Your Productivity Score
                  </dt>
                  <dd className="mt-1 text-5xl font-semibold text-indigo-600">
                    {productivity?.score || 0}/100
                  </dd>
                  <dt className="mt-3 text-sm font-medium text-gray-500">
                    Current Level: <span className="text-indigo-600 font-bold">{productivity?.level || 'Beginner'}</span>
                  </dt>
                  {productivity?.nextLevel && (
                    <div className="mt-4">
                      <div className="text-xs text-gray-500">
                        {productivity.pointsToNextLevel} points to {productivity.nextLevel}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ 
                            width: `${(productivity.score / (productivity.score + productivity.pointsToNextLevel)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Productivity components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Score Breakdown</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Completion ({productivity?.components?.completion || 0}/40)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${((productivity?.components?.completion || 0) / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Streak ({productivity?.components?.streak || 0}/30)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
                          style={{ width: `${((productivity?.components?.streak || 0) / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Consistency ({productivity?.components?.consistency || 0}/20)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ width: `${((productivity?.components?.consistency || 0) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Variety ({productivity?.components?.variety || 0}/10)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-yellow-600 h-2.5 rounded-full" 
                          style={{ width: `${((productivity?.components?.variety || 0) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Score Analysis</h3>
                  <div className="h-64">
                    <Radar
                      data={productivityData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            angleLines: {
                              display: true
                            },
                            suggestedMin: 0,
                            suggestedMax: 40
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Level explanations */}
              <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Productivity Levels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className={`p-4 rounded-lg border ${
                      productivity?.level === 'Beginner' ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className="font-medium text-gray-900">Beginner</h4>
                      <p className="text-sm text-gray-600 mt-1">Starting your habit journey</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      productivity?.level === 'Consistent' ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className="font-medium text-gray-900">Consistent</h4>
                      <p className="text-sm text-gray-600 mt-1">Building regular habits</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      productivity?.level === 'Dedicated' ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className="font-medium text-gray-900">Dedicated</h4>
                      <p className="text-sm text-gray-600 mt-1">Committed to your goals</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      productivity?.level === 'Expert' ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className="font-medium text-gray-900">Expert</h4>
                      <p className="text-sm text-gray-600 mt-1">Mastering your habits</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${
                      productivity?.level === 'Master' ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <h4 className="font-medium text-gray-900">Master</h4>
                      <p className="text-sm text-gray-600 mt-1">Top-tier habit builder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="space-y-6">
              {insights?.hasMoodData ? (
                <>
                  <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Insights</h3>
                      
                      {insights.insights.length > 0 ? (
                        <div className="space-y-4">
                          {insights.insights.map((insight, index) => (
                            <div 
                              key={index}
                              className={`p-4 rounded-lg ${
                                insight.severity === 'warning' 
                                  ? 'bg-amber-50 border-l-4 border-amber-400'
                                  : 'bg-green-50 border-l-4 border-green-400'
                              }`}
                            >
                              <div className="flex">
                                <div className="ml-3">
                                  <h4 className={`text-sm font-medium ${
                                    insight.severity === 'warning' ? 'text-amber-800' : 'text-green-800'
                                  }`}>
                                    {insight.type === 'mood' ? 'Mood Insight' : 'Stress Insight'}
                                  </h4>
                                  <p className="text-sm mt-2 text-gray-700">{insight.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <p>No insights available yet.</p>
                          <p className="mt-1 text-sm">Continue tracking your habits to receive personalized insights.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-lg">
                          <h4 className="font-medium text-indigo-900">Habit Improvement</h4>
                          <ul className="mt-2 space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>Track habits at the same time each day</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>Start with easier goals and gradually increase difficulty</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-indigo-500 mr-2">•</span>
                              <span>Use visual cues to remind yourself of habits</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <h4 className="font-medium text-purple-900">Wellbeing Tips</h4>
                          <ul className="mt-2 space-y-2 text-sm text-gray-700">
                            <li className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              <span>Practice mindfulness for 5 minutes daily</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              <span>Get 7-8 hours of sleep consistently</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              <span>Take short breaks during extended screen time</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Mood or Stress Data</h3>
                    <p className="text-gray-500 mb-4">
                      Start tracking your mood or stress levels to get personalized insights.
                    </p>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Mood Habit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StatsModal; 
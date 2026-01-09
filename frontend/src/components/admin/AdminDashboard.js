import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import CategoryManager from './CategoryManager';
import NotificationManager from './NotificationManager';
import BadgeManager from './BadgeManager';
import AdminHabitScheduler from './AdminHabitScheduler';
import AdminHabitDNA from './AdminHabitDNA';
import {
  UserIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  BellIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHabits, setUserHabits] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch admin stats
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch all users
        const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.response?.data?.message || 'Error fetching admin data');
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchAdminData();
    } else {
      setLoading(false);
      setError('You do not have admin privileges');
    }
  }, [token, user]);

  const fetchUserHabits = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.get(`http://localhost:5000/api/admin/users/${userId}/habits`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUserHabits(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user habits:', err);
      setError(err.response?.data?.message || 'Error fetching user habits');
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId) => {
    setSelectedUser(userId);
    await fetchUserHabits(userId);
    setActiveTab('userHabits');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} p-6 flex justify-center items-center transition-colors duration-200`}>
        <div className={`animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-500'} transition-colors duration-200`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} p-6 transition-colors duration-200`}>
        <div className={`${theme === 'dark' ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-4 transition-colors duration-200`}>
          <div className="flex">
            <div className="ml-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-700'} transition-colors duration-200`}>{error}</p>
              <p className="text-sm mt-2">
                <Link to="/dashboard" className={`${theme === 'dark' ? 'text-red-300 hover:text-red-200' : 'text-red-700 hover:text-red-600'} font-medium transition-colors duration-200`}>
                  Return to Dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} p-6 transition-colors duration-200`}>
        <div className={`${theme === 'dark' ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 mb-4 transition-colors duration-200`}>
          <div className="flex">
            <div className="ml-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-yellow-200' : 'text-yellow-700'} transition-colors duration-200`}>Only administrators can access this page.</p>
              <p className="text-sm mt-2">
                <Link to="/dashboard" className={`${theme === 'dark' ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-700 hover:text-yellow-600'} font-medium transition-colors duration-200`}>
                  Return to Dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} transition-colors duration-200`}>
      <header className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} shadow transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>Admin: {user?.firstName} {user?.lastName}</span>
            <Link
              to="/dashboard"
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${theme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'users'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('users')}
              >
                Users
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'categories'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('categories')}
              >
                Categories
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'badges'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('badges')}
              >
                Badges
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'scheduledHabits'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('scheduledHabits')}
              >
                Habitudes Planifiées
              </button>
              <button
                className={`px-4 py-4 text-sm font-medium ${
                  activeTab === 'habitDNA'
                    ? 'text-indigo-600 border-b-2 border-indigo-500'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('habitDNA')}
              >
                Habit DNA
              </button>
              {selectedUser && (
                <button
                  className={`px-4 py-4 text-sm font-medium ${
                    activeTab === 'userHabits'
                      ? 'text-indigo-600 border-b-2 border-indigo-500'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('userHabits')}
                >
                  User Habits
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stats cards */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats?.totalUsers || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClipboardDocumentListIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Habits</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats?.totalHabits || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">New Users (7 days)</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats?.newUsers || 0}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChartBarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Avg Habits/User</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats?.totalUsers > 0 ? (stats.totalHabits / stats.totalUsers).toFixed(1) : '0'}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Habits by category */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Habits by Category</h3>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Count
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.habitsByCategory?.map((category) => (
                      <tr key={category._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.name || category._id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.count}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {stats.totalHabits > 0 ? ((category.count / stats.totalHabits) * 100).toFixed(1) : '0'}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Stats */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Statistics</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Detailed statistics for each user
                </p>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Habits Count
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.userStats?.map((userStat) => (
                      <tr key={userStat._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {userStat.firstName?.charAt(0) || ''}{userStat.lastName?.charAt(0) || ''}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userStat.firstName} {userStat.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{userStat.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{userStat.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userStat.isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {userStat.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {userStat.habitCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(userStat.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userStat.lastActivity ? new Date(userStat.lastActivity).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserSelect(userStat._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Habits
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Habits by Category */}
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Habits by Category</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Breakdown of habits by category for each user
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        {stats?.habitsByCategory?.map(category => (
                          <th key={category._id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {category.name || category._id}
                          </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats?.userStats?.map((userStat) => (
                        <tr key={userStat._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {userStat.firstName} {userStat.lastName}
                            </div>
                          </td>
                          {stats?.habitsByCategory?.map(category => {
                            const userCategory = userStat.habitsByCategory.find(c => c._id === category._id);
                            return (
                              <td key={`${userStat._id}-${category._id}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {userCategory ? userCategory.count : 0}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {userStat.habitCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">All Users</h3>
                <span className="text-sm text-gray-500">{users.length} users found</span>
              </div>
              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {user.firstName?.charAt(0) || ''}{user.lastName?.charAt(0) || ''}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.username}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleUserSelect(user._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Habits
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="px-4 py-6 sm:px-0">
            <CategoryManager />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="px-4 py-6 sm:px-0">
            <NotificationManager />
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="px-4 py-6 sm:px-0">
            <BadgeManager />
          </div>
        )}

        {activeTab === 'scheduledHabits' && (
          <div className="px-4 py-6 sm:px-0">
            <AdminHabitScheduler />
          </div>
        )}

        {activeTab === 'habitDNA' && (
          <div className="px-4 py-6 sm:px-0">
            <AdminHabitDNA />
          </div>
        )}

        {activeTab === 'userHabits' && (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Habits
                  {users.find(u => u._id === selectedUser) && (
                    <span className="ml-2 text-gray-600">
                      - {users.find(u => u._id === selectedUser).firstName} {users.find(u => u._id === selectedUser).lastName}
                    </span>
                  )}
                </h3>
                <span className="text-sm text-gray-500">{userHabits.length} habits found</span>
              </div>
              <div className="border-t border-gray-200">
                {userHabits.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Habit Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userHabits.map((habit) => (
                        <tr key={habit._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{habit.name}</div>
                            {habit.notes && (
                              <div className="text-sm text-gray-500">{habit.notes}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {habit.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {habit.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {habit.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(habit.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-500">No habits found for this user.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
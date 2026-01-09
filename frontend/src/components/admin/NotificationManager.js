import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BellIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import NotificationContext from '../../context/NotificationContext';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';

const NotificationManager = () => {
  const { notifications, fetchNotifications, createNotification, deleteNotification } = useContext(NotificationContext);
  const { token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info',
    isGlobal: false,
    link: ''
  });

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Error fetching users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createNotification(formData);
      setFormData({
        userId: '',
        title: '',
        message: '',
        type: 'info',
        isGlobal: false,
        link: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating notification');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} shadow overflow-hidden sm:rounded-lg transition-colors duration-200`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
            Notification Management
          </h3>
          <p className={`mt-1 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>
            Create and manage notifications for users
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            theme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Notification
        </button>
      </div>

      {error && (
        <div className={`${theme === 'dark' ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-4 transition-colors duration-200`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-red-300' : 'text-red-400'}`} aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className={`text-sm ${theme === 'dark' ? 'text-red-200' : 'text-red-700'} transition-colors duration-200`}>{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    theme === 'dark' ? 'text-red-300 hover:bg-red-800' : 'text-red-500 hover:bg-red-100'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200`}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 py-5 sm:px-6 transition-colors duration-200`}
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="title" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="type" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Type
                </label>
                <div className="mt-1">
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="message" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Message *
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isGlobal"
                      name="isGlobal"
                      type="checkbox"
                      checked={formData.isGlobal}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isGlobal" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                      Global Notification
                    </label>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                      Send to all users
                    </p>
                  </div>
                </div>
              </div>

              {!formData.isGlobal && (
                <div className="sm:col-span-3">
                  <label htmlFor="userId" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                    User
                  </label>
                  <div className="mt-1">
                    <select
                      id="userId"
                      name="userId"
                      required={!formData.isGlobal}
                      value={formData.userId}
                      onChange={handleInputChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                      } rounded-md transition-colors duration-200`}
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="sm:col-span-6">
                <label htmlFor="link" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Link (optional)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="link"
                    id="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="e.g. /dashboard"
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`inline-flex items-center px-4 py-2 border ${
                  theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  theme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                Create
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-200`}>
          <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-200`}>
                Type
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-200`}>
                Title
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-200`}>
                Message
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-200`}>
                Recipient
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-200`}>
                Created
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider transition-colors duration-200`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y transition-colors duration-200`}>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${theme === 'dark' ? 'border-gray-400' : 'border-gray-600'} mx-auto`}></div>
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                  No notifications found
                </td>
              </tr>
            ) : (
              notifications.map((notification) => (
                <tr key={notification._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getNotificationIcon(notification.type)}
                      <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-200`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-200`}>
                    {notification.title}
                  </td>
                  <td className={`px-6 py-4 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-200`}>
                    <div className="max-w-xs truncate">{notification.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      notification.isGlobal
                        ? theme === 'dark' ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                        : theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    } transition-colors duration-200`}>
                      {notification.isGlobal ? 'All Users' : 'Individual'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-200`}>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className={`text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'} transition-colors duration-200`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationManager;

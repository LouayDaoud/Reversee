import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import NotificationContext from '../../context/NotificationContext';
import ThemeContext from '../../context/ThemeContext';

const NotificationCenter = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const { theme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
      >
        <span className="sr-only">View notifications</span>
        {unreadCount > 0 ? (
          <BellAlertIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <BellIcon className="h-6 w-6" aria-hidden="true" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}
          >
            <div className="py-1">
              <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                    }`}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className={`max-h-96 overflow-y-auto ${theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                {loading ? (
                  <div className="px-4 py-8 text-center">
                    <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${theme === 'dark' ? 'border-gray-400' : 'border-gray-600'} mx-auto`}></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 flex items-start ${
                        !notification.isRead
                          ? theme === 'dark'
                            ? 'bg-gray-700'
                            : 'bg-indigo-50'
                          : ''
                      } ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification._id)}
                              className={`ml-2 flex-shrink-0 ${
                                theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-400'
                              }`}
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className="mt-1 flex justify-between items-center">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatDate(notification.createdAt)}
                          </p>
                          {notification.link && (
                            <Link
                              to={notification.link}
                              className={`text-xs font-medium ${
                                theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                              }`}
                              onClick={() => markAsRead(notification._id)}
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;

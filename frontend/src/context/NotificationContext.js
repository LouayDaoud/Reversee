import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Error fetching notifications');
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await axios.get(`${API_URL}/notifications/unread/count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUnreadCount(res.data.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated || !token) return;

    try {
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update unread count
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !token) return;

    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );

      // Update unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Create notification (admin only)
  const createNotification = async (notificationData) => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await axios.post(`${API_URL}/notifications`, notificationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh notifications
      fetchNotifications();
      return res.data.data;
    } catch (err) {
      console.error('Error creating notification:', err);
      throw err;
    }
  };

  // Delete notification (admin only)
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated || !token) return;

    try {
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isAuthenticated, token]);

  // Set up polling for unread count (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        createNotification,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

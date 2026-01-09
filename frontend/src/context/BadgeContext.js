import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import NotificationContext from './NotificationContext';

const BadgeContext = createContext();

export const BadgeProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newBadges, setNewBadges] = useState([]);

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch all badges
  const fetchBadges = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/badges`);
      setBadges(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError(err.response?.data?.message || 'Error fetching badges');
      setLoading(false);
    }
  };

  // Fetch user badges
  const fetchUserBadges = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/badges/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserBadges(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user badges:', err);
      setError(err.response?.data?.message || 'Error fetching user badges');
      setLoading(false);
    }
  };

  // Variable pour suivre le dernier appel à checkForBadges
  const [lastBadgeCheck, setLastBadgeCheck] = useState(0);

  // Check for new badges avec protection contre les appels trop fréquents
  const checkForBadges = async () => {
    if (!isAuthenticated || !token) return;

    // Limiter les appels à une fois toutes les 30 secondes
    const now = Date.now();
    if (now - lastBadgeCheck < 30000) {
      console.log('Badge check skipped - called too frequently');
      return null;
    }

    setLastBadgeCheck(now);
    setLoading(true);
    setError(null);

    try {
      console.log('Checking for badges...');
      const res = await axios.post(`${API_URL}/badges/check`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Badge check response:', res.data);

      if (res.data.data.newBadges && res.data.data.newBadges.length > 0) {
        setNewBadges(res.data.data.newBadges);
        // Refresh notifications to show badge notifications
        fetchNotifications();
      }

      // Refresh user badges
      fetchUserBadges();

      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error checking for badges:', err);
      setError(err.response?.data?.message || 'Error checking for badges');
      setLoading(false);
      return null;
    }
  };

  // Mark badge as viewed
  const markBadgeAsViewed = async (badgeId) => {
    if (!isAuthenticated || !token) return;

    try {
      await axios.put(`${API_URL}/badges/${badgeId}/view`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local state
      setUserBadges(prevBadges =>
        prevBadges.map(badge =>
          badge._id === badgeId
            ? { ...badge, isViewed: true }
            : badge
        )
      );
    } catch (err) {
      console.error('Error marking badge as viewed:', err);
    }
  };

  // Clear new badges notification
  const clearNewBadges = () => {
    setNewBadges([]);
  };

  // Assign badge to user (admin only)
  const assignBadgeToUser = async (badgeId, userId) => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await axios.post(`${API_URL}/badges/${badgeId}/assign`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh user badges if the assigned user is the current user
      // This ensures the badge appears immediately in their collection
      if (userId === user?.id) {
        await fetchUserBadges();
      }

      return res.data;
    } catch (err) {
      console.error('Error assigning badge to user:', err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBadges();
  }, []);

  // Fetch user badges when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserBadges();
    }
  }, [isAuthenticated, token]);

  return (
    <BadgeContext.Provider
      value={{
        badges,
        userBadges,
        loading,
        error,
        newBadges,
        fetchBadges,
        fetchUserBadges,
        checkForBadges,
        markBadgeAsViewed,
        clearNewBadges,
        assignBadgeToUser
      }}
    >
      {children}
    </BadgeContext.Provider>
  );
};

export default BadgeContext;

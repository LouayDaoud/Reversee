import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

export const HabitContext = createContext();

export const HabitProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Get all habits
  const getHabits = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.category) queryParams.append('category', filters.category);

      const queryString = queryParams.toString();
      const url = `${API_URL}/habits${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching habits from:', url);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Habits fetched successfully:', res.data);
      setHabits(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching habits:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        request: err.request ? 'Request exists' : 'No request object'
      });

      setError(err.response?.data?.message || err.message || 'Failed to fetch habits');
      setLoading(false);
      throw err;
    }
  }, [token, API_URL]);

  // Add new habit
  const addHabit = async (habitData) => {
    try {
      const res = await axios.post(`${API_URL}/habits`, habitData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setHabits([res.data.data, ...habits]);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add habit');
      throw err;
    }
  };

  // Update habit
  const updateHabit = async (id, habitData) => {
    try {
      const res = await axios.put(`${API_URL}/habits/${id}`, habitData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setHabits(
        habits.map(habit =>
          habit._id === id ? res.data.data : habit
        )
      );

      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update habit');
      throw err;
    }
  };

  // Delete habit
  const deleteHabit = async (id) => {
    try {
      await axios.delete(`${API_URL}/habits/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setHabits(habits.filter(habit => habit._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete habit');
      throw err;
    }
  };

  // Clear errors
  const clearError = () => {
    setError(null);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        loading,
        error,
        getHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        clearError
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export default HabitContext;

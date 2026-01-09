import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [analysis, setAnalysis] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch habit analysis
  const fetchHabitAnalysis = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/analysis/habits`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAnalysis(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching habit analysis:', err);
      setError(err.response?.data?.message || 'Error fetching analysis');
      setLoading(false);
      throw err;
    }
  };

  // Fetch AI insights
  const fetchAIInsights = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/analysis/ai-insights`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAiInsights(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError(err.response?.data?.message || 'Error fetching AI insights');
      setLoading(false);
      throw err;
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/analysis/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRecommendations(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Error fetching recommendations');
      setLoading(false);
      throw err;
    }
  };

  // Fetch weekly report
  const fetchWeeklyReport = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/analysis/weekly-report`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setWeeklyReport(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      console.error('Error fetching weekly report:', err);
      setError(err.response?.data?.message || 'Error fetching weekly report');
      setLoading(false);
      throw err;
    }
  };

  // Get complete analysis (all data at once)
  const getCompleteAnalysis = async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch analysis data step by step to better handle errors
      let analysisData = null;
      let insightsData = null;
      let recommendationsData = null;
      let reportData = null;

      // 1. Fetch basic analysis first (most important)
      try {
        const res = await axios.get(`${API_URL}/analysis/habits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        analysisData = res.data.data;
        setAnalysis(analysisData);
      } catch (err) {
        console.error('Error fetching habit analysis:', err);
        setError('Error fetching habit analysis');
      }

      // 2. Fetch AI insights (can fail if no API key)
      try {
        const res = await axios.get(`${API_URL}/analysis/ai-insights`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        insightsData = res.data.data;
        setAiInsights(insightsData);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        // Don't set error for AI insights as it's optional
      }

      // 3. Fetch recommendations
      try {
        const res = await axios.get(`${API_URL}/analysis/recommendations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        recommendationsData = res.data.data;
        setRecommendations(recommendationsData);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        // Don't set error for recommendations as it's optional
      }

      // 4. Skip weekly report for now as it seems to cause issues
      // try {
      //   reportData = await fetchWeeklyReport();
      // } catch (err) {
      //   console.error('Error fetching weekly report:', err);
      // }

      setLoading(false);
      return {
        analysis: analysisData,
        insights: insightsData,
        recommendations: recommendationsData,
        report: reportData
      };
    } catch (err) {
      console.error('Error getting complete analysis:', err);
      setError('Error fetching analysis data');
      setLoading(false);
      throw err;
    }
  };

  // Clear analysis data
  const clearAnalysis = () => {
    setAnalysis(null);
    setAiInsights(null);
    setRecommendations([]);
    setWeeklyReport(null);
    setError(null);
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        aiInsights,
        recommendations,
        weeklyReport,
        loading,
        error,
        fetchHabitAnalysis,
        fetchAIInsights,
        fetchRecommendations,
        fetchWeeklyReport,
        getCompleteAnalysis,
        clearAnalysis
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export default AnalysisContext;

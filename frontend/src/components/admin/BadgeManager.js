import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import BadgeContext from '../../context/BadgeContext';
import Badge from '../badges/Badge';

const BadgeManager = () => {
  const { token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const { assignBadgeToUser } = useContext(BadgeContext);
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'trophy',
    category: 'achievement',
    criteria: {
      type: 'habit_count',
      value: 1,
      category: ''
    },
    level: 1,
    color: 'blue',
    isActive: true
  });

  // API Base URL
  const API_URL = 'http://localhost:5000/api';

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/badges`);
        setBadges(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError(err.response?.data?.message || 'Error fetching badges');
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(res.data.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, [token]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('criteria.')) {
      const criteriaField = name.split('.')[1];
      setFormData({
        ...formData,
        criteria: {
          ...formData.criteria,
          [criteriaField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (editingBadge) {
        // Update existing badge
        await axios.put(`${API_URL}/badges/${editingBadge._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Create new badge
        await axios.post(`${API_URL}/badges`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      // Refresh badges
      const res = await axios.get(`${API_URL}/badges`);
      setBadges(res.data.data);

      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: 'trophy',
        category: 'achievement',
        criteria: {
          type: 'habit_count',
          value: 1,
          category: ''
        },
        level: 1,
        color: 'blue',
        isActive: true
      });
      setEditingBadge(null);
      setShowForm(false);
      setLoading(false);
    } catch (err) {
      console.error('Error saving badge:', err);
      setError(err.response?.data?.message || 'Error saving badge');
      setLoading(false);
    }
  };

  // Handle badge edit
  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      criteria: {
        type: badge.criteria.type,
        value: badge.criteria.value,
        category: badge.criteria.category || ''
      },
      level: badge.level,
      color: badge.color,
      isActive: badge.isActive
    });
    setShowForm(true);
  };

  // Handle badge delete
  const handleDelete = async (badgeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce badge ?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/badges/${badgeId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Refresh badges
      const res = await axios.get(`${API_URL}/badges`);
      setBadges(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting badge:', err);
      setError(err.response?.data?.message || 'Error deleting badge');
      setLoading(false);
    }
  };

  // Open assign badge form
  const handleOpenAssignForm = (badge) => {
    setSelectedBadge(badge);
    setSelectedUserId('');
    setShowAssignForm(true);
  };

  // Handle assign badge to user
  const handleAssignBadge = async (e) => {
    e.preventDefault();

    if (!selectedBadge || !selectedUserId) {
      setError('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      setLoading(true);
      await assignBadgeToUser(selectedBadge._id, selectedUserId);

      setShowAssignForm(false);
      setSelectedBadge(null);
      setSelectedUserId('');
      setLoading(false);

      // Show success message
      alert(`Badge "${selectedBadge.name}" attribué avec succès !`);
    } catch (err) {
      console.error('Error assigning badge:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'attribution du badge');
      setLoading(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} shadow overflow-hidden sm:rounded-lg transition-colors duration-200`}>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
            Gestion des badges
          </h3>
          <p className={`mt-1 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-200`}>
            Créez et gérez les badges pour récompenser les utilisateurs
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBadge(null);
            setFormData({
              name: '',
              description: '',
              icon: 'trophy',
              category: 'achievement',
              criteria: {
                type: 'habit_count',
                value: 1,
                category: ''
              },
              level: 1,
              color: 'blue',
              isActive: true
            });
            setShowForm(!showForm);
          }}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            theme === 'dark' ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Nouveau Badge
        </button>
      </div>

      {error && (
        <div className={`${theme === 'dark' ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-4 transition-colors duration-200`}>
          <div className="flex">
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

      {showAssignForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} px-4 py-5 sm:px-6 transition-colors duration-200`}
        >
          <form onSubmit={handleAssignBadge}>
            <div className="mb-4">
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Attribuer le badge "{selectedBadge?.name}" à un utilisateur
              </h3>
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                Sélectionnez un utilisateur pour lui attribuer ce badge.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="userId" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                Utilisateur *
              </label>
              <select
                id="userId"
                name="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className={`mt-1 block w-full py-2 px-3 border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 bg-white text-gray-900'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className={`inline-flex items-center px-4 py-2 border ${
                  theme === 'dark' ? 'border-gray-600 text-gray-200 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'bg-indigo-700 hover:bg-indigo-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                {loading ? 'Attribution...' : 'Attribuer le badge'}
              </button>
            </div>
          </form>
        </motion.div>
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
                <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Nom *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="icon" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Icône
                </label>
                <div className="mt-1">
                  <select
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  >
                    <option value="trophy">Trophée</option>
                    <option value="star">Étoile</option>
                    <option value="fire">Feu</option>
                    <option value="sparkles">Étincelles</option>
                    <option value="heart">Cœur</option>
                    <option value="lightbulb">Ampoule</option>
                    <option value="bolt">Éclair</option>
                    <option value="academic">Diplôme</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Catégorie
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  >
                    <option value="achievement">Accomplissement</option>
                    <option value="milestone">Jalon</option>
                    <option value="consistency">Constance</option>
                    <option value="special">Spécial</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="level" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Niveau
                </label>
                <div className="mt-1">
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="color" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Couleur
                </label>
                <div className="mt-1">
                  <select
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  >
                    <option value="blue">Bleu</option>
                    <option value="red">Rouge</option>
                    <option value="green">Vert</option>
                    <option value="yellow">Jaune</option>
                    <option value="purple">Violet</option>
                    <option value="pink">Rose</option>
                    <option value="indigo">Indigo</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Critères d'obtention
                </h4>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="criteria.type" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Type de critère
                </label>
                <div className="mt-1">
                  <select
                    id="criteria.type"
                    name="criteria.type"
                    value={formData.criteria.type}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  >
                    <option value="habit_count">Nombre d'habitudes</option>
                    <option value="streak">Série consécutive</option>
                    <option value="category_count">Habitudes par catégorie</option>
                    <option value="days_active">Jours actifs</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="criteria.value" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                  Valeur requise
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="criteria.value"
                    name="criteria.value"
                    min="1"
                    value={formData.criteria.value}
                    onChange={handleInputChange}
                    className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    } rounded-md transition-colors duration-200`}
                  />
                </div>
              </div>

              {formData.criteria.type === 'category_count' && (
                <div className="sm:col-span-2">
                  <label htmlFor="criteria.category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                    Catégorie d'habitude
                  </label>
                  <div className="mt-1">
                    <select
                      id="criteria.category"
                      name="criteria.category"
                      value={formData.criteria.category}
                      onChange={handleInputChange}
                      className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                      } rounded-md transition-colors duration-200`}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="sleep">Sommeil</option>
                      <option value="exercise">Exercice</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="mood">Humeur</option>
                      <option value="stress">Stress</option>
                      <option value="screen">Temps d'écran</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="isActive" className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                      Badge actif
                    </label>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                      Les badges inactifs ne sont pas visibles par les utilisateurs
                    </p>
                  </div>
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
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'bg-indigo-700 hover:bg-indigo-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
              >
                {loading ? 'Enregistrement...' : editingBadge ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
        {loading && !showForm ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${theme === 'dark' ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
          </div>
        ) : badges.length === 0 ? (
          <div className="p-6 text-center">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              Aucun badge n'a été créé. Cliquez sur "Nouveau Badge" pour commencer.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {badges.map(badge => (
                <div key={badge._id} className="relative group">
                  <Badge badge={badge} earned={true} />

                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleOpenAssignForm(badge)}
                      className={`p-1 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-green-400 hover:bg-gray-600' : 'bg-white text-green-600 hover:bg-gray-100'} shadow`}
                      title="Attribuer à un utilisateur"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(badge)}
                      className={`p-1 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100'} shadow`}
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(badge._id)}
                      className={`p-1 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-red-400 hover:bg-gray-600' : 'bg-white text-red-500 hover:bg-gray-100'} shadow`}
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeManager;

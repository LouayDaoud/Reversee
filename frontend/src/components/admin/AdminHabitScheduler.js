import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import scheduledHabitService from '../../services/scheduledHabitService';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const AdminHabitScheduler = () => {
  const { token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [scheduledHabits, setScheduledHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      recurrence: 'daily',
      autoCreate: true
    }
  });

  const recurrence = watch('recurrence');

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchScheduledHabits();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchScheduledHabits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduledHabitService.getAllScheduledHabits();
      // Le service retourne déjà response.data, qui contient { success, data, count }
      if (response.success && response.data) {
        setScheduledHabits(response.data || []);
      } else {
        setScheduledHabits([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching scheduled habits:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des habitudes planifiées');
      setScheduledHabits([]);
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const habitData = {
        userId: data.userId,
        category: data.category,
        name: data.name,
        targetValue: parseFloat(data.targetValue),
        unit: data.unit,
        recurrence: data.recurrence,
        daysOfWeek: data.recurrence === 'weekly' ? data.daysOfWeek.map(Number) : [],
        startDate: data.startDate,
        endDate: data.endDate || null,
        preferredTime: data.preferredTime || null,
        instructions: data.instructions || '',
        autoCreate: data.autoCreate || true
      };

      let result;
      if (editingHabit) {
        result = await scheduledHabitService.updateScheduledHabit(editingHabit._id, habitData);
        setSuccess('Habitude planifiée mise à jour avec succès');
      } else {
        result = await scheduledHabitService.assignScheduledHabit(habitData);
        setSuccess('Habitude planifiée assignée avec succès');
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'opération');
      }

      reset();
      setShowForm(false);
      setEditingHabit(null);
      fetchScheduledHabits();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'assignation');
      setLoading(false);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    reset({
      userId: habit.user._id || habit.user,
      category: habit.category,
      name: habit.name,
      targetValue: habit.targetValue,
      unit: habit.unit,
      recurrence: habit.recurrence,
      daysOfWeek: habit.daysOfWeek || [],
      startDate: habit.startDate ? new Date(habit.startDate).toISOString().split('T')[0] : '',
      endDate: habit.endDate ? new Date(habit.endDate).toISOString().split('T')[0] : '',
      preferredTime: habit.preferredTime || '',
      instructions: habit.instructions || '',
      autoCreate: habit.autoCreate
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette habitude planifiée ?')) {
      return;
    }

    try {
      setLoading(true);
      await scheduledHabitService.deleteScheduledHabit(id);
      setSuccess('Habitude planifiée supprimée avec succès');
      fetchScheduledHabits();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHabit(null);
    reset();
  };

  const categories = [
    { id: 'sleep', name: 'Sleep' },
    { id: 'exercise', name: 'Exercise' },
    { id: 'screen', name: 'Screen Time' },
    { id: 'mood', name: 'Mood' },
    { id: 'stress', name: 'Stress' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'other', name: 'Other' }
  ];

  const daysOfWeekOptions = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'green', icon: CheckCircleIcon, text: 'Active' },
      paused: { color: 'yellow', icon: ClockIcon, text: 'En pause' },
      completed: { color: 'blue', icon: CheckCircleIcon, text: 'Terminée' },
      cancelled: { color: 'red', icon: XCircleIcon, text: 'Annulée' }
    };

    const badge = badges[status] || badges.active;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-800`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const filteredHabits = selectedUserId
    ? scheduledHabits.filter(h => (h.user._id || h.user) === selectedUserId)
    : scheduledHabits;

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
          Gestion des Habitudes Planifiées
        </h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingHabit(null);
            reset();
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
            theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors duration-200`}
        >
          + Assigner une Habitude
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Filter by user */}
      <div className="mb-4">
        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
          Filtrer par utilisateur
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className={`w-full px-3 py-2 rounded-md border ${
            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        >
          <option value="">Tous les utilisateurs</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.firstName} {user.lastName} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6 transition-colors duration-200`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingHabit ? 'Modifier l\'habitude planifiée' : 'Assigner une habitude planifiée'}
              </h3>
              <button onClick={handleCancel} className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Utilisateur *
                </label>
                <select
                  {...register('userId', { required: 'Utilisateur requis' })}
                  className={`w-full px-3 py-2 rounded-md border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.userId && <p className="text-red-500 text-sm mt-1">{errors.userId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Catégorie *
                  </label>
                  <select
                    {...register('category', { required: 'Catégorie requise' })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Nom de l'habitude *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Nom requis' })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Valeur cible *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('targetValue', { required: 'Valeur cible requise', min: 0 })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  {errors.targetValue && <p className="text-red-500 text-sm mt-1">{errors.targetValue.message}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Unité *
                  </label>
                  <input
                    type="text"
                    {...register('unit', { required: 'Unité requise' })}
                    placeholder="ex: heures, km, verres"
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Récurrence *
                </label>
                <select
                  {...register('recurrence', { required: 'Récurrence requise' })}
                  className={`w-full px-3 py-2 rounded-md border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="custom">Personnalisée</option>
                </select>
              </div>

              {recurrence === 'weekly' && (
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Jours de la semaine *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {daysOfWeekOptions.map((day) => (
                      <label key={day.value} className="flex items-center">
                        <input
                          type="checkbox"
                          value={day.value}
                          {...register('daysOfWeek', { required: recurrence === 'weekly' ? 'Au moins un jour requis' : false })}
                          className="mr-2"
                        />
                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                          {day.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.daysOfWeek && <p className="text-red-500 text-sm mt-1">{errors.daysOfWeek.message}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Date de début *
                  </label>
                  <input
                    type="date"
                    {...register('startDate', { required: 'Date de début requise' })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className={`w-full px-3 py-2 rounded-md border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Heure préférée (optionnel)
                </label>
                <input
                  type="time"
                  {...register('preferredTime')}
                  className={`w-full px-3 py-2 rounded-md border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-1`}>
                  Instructions (optionnel)
                </label>
                <textarea
                  {...register('instructions')}
                  rows="3"
                  className={`w-full px-3 py-2 rounded-md border ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('autoCreate')}
                  className="mr-2"
                />
                <label className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                  Créer automatiquement les habitudes quotidiennes
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`px-4 py-2 rounded-md border ${
                    theme === 'dark' ? 'border-gray-600 text-gray-200 bg-gray-700' : 'border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editingHabit ? 'Mettre à jour' : 'Assigner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Habits List */}
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Utilisateur
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Habitude
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Récurrence
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Période
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Statut
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
            {loading && filteredHabits.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                </td>
              </tr>
            ) : filteredHabits.length === 0 ? (
              <tr>
                <td colSpan="6" className={`px-6 py-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Aucune habitude planifiée
                </td>
              </tr>
            ) : (
              filteredHabits.map((habit) => (
                <tr key={habit._id}>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {habit.user?.firstName || 'N/A'} {habit.user?.lastName || ''}
                    <br />
                    <span className="text-sm text-gray-500">{habit.user?.email || ''}</span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <div className="font-medium">{habit.name}</div>
                    <div className="text-sm text-gray-500">
                      {habit.targetValue} {habit.unit} - {categories.find(c => c.id === habit.category)?.name}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {habit.recurrence === 'daily' ? 'Quotidienne' : 
                     habit.recurrence === 'weekly' ? `Hebdomadaire (${habit.daysOfWeek?.length || 0} jours)` :
                     'Personnalisée'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <div className="text-sm">
                      {new Date(habit.startDate).toLocaleDateString('fr-FR')}
                    </div>
                    {habit.endDate && (
                      <div className="text-sm text-gray-500">
                        au {new Date(habit.endDate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(habit.status)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <button
                      onClick={() => handleEdit(habit)}
                      className={`mr-3 ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(habit._id)}
                      className={theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}
                    >
                      <TrashIcon className="w-5 h-5" />
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

export default AdminHabitScheduler;


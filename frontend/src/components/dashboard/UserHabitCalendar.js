import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import scheduledHabitService from '../../services/scheduledHabitService';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const UserHabitCalendar = () => {
  const { theme } = useContext(ThemeContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchCalendarEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculer le début et la fin du mois
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Étendre pour inclure quelques jours avant et après
      const startDate = new Date(startOfMonth);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Commencer au dimanche
      
      const endDate = new Date(endOfMonth);
      const daysToAdd = 6 - endDate.getDay();
      endDate.setDate(endDate.getDate() + daysToAdd); // Finir au samedi

      const response = await scheduledHabitService.getScheduledHabitsForCalendar(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      // Le service retourne déjà response.data, qui contient { success, data, count }
      if (response.success && response.data) {
        setCalendarEvents(response.data || []);
      } else {
        setCalendarEvents([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement du calendrier');
      setCalendarEvents([]);
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours du mois précédent
    const prevMonth = new Date(year, month - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const days = getDaysInMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const getCategoryColor = (category) => {
    const colors = {
      sleep: 'bg-blue-500',
      exercise: 'bg-green-500',
      screen: 'bg-purple-500',
      mood: 'bg-yellow-500',
      stress: 'bg-red-500',
      nutrition: 'bg-orange-500',
      other: 'bg-gray-500'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
          <CalendarIcon className="inline-block w-6 h-6 mr-2" />
          Calendrier des Habitudes
        </h2>
        <button
          onClick={goToToday}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          } transition-colors duration-200`}
        >
          Aujourd'hui
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-200`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-200`}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className={`text-center text-sm font-medium py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const events = getEventsForDate(day.date);
          const isSelected = selectedDate && day.date.getTime() === selectedDate.getTime();
          const isCurrentDay = isToday(day.date);

          return (
            <motion.button
              key={index}
              onClick={() => setSelectedDate(day.date)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                min-h-[80px] p-1 rounded-md border-2 transition-colors duration-200
                ${!day.isCurrentMonth ? (theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-400') : ''}
                ${day.isCurrentMonth && !isSelected && !isCurrentDay ? (theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300') : ''}
                ${isCurrentDay && !isSelected ? 'border-indigo-500 bg-indigo-50' : ''}
                ${isSelected ? 'border-indigo-600 bg-indigo-100' : ''}
              `}
            >
              <div className={`text-sm font-medium mb-1 ${day.isCurrentMonth ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {events.slice(0, 2).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs px-1 py-0.5 rounded ${getCategoryColor(event.category)} text-white truncate`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {events.length > 2 && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    +{events.length - 2} autres
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200`}
        >
          <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
            Habitudes pour le {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h4>
          {selectedDateEvents.length === 0 ? (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Aucune habitude planifiée pour ce jour
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDateEvents.map((event, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} border-l-4 ${getCategoryColor(event.category).replace('bg-', 'border-')} transition-colors duration-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                        {event.title}
                      </h5>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-200`}>
                        Objectif: {event.targetValue} {event.unit}
                      </p>
                      {event.instructions && (
                        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                          {event.instructions}
                        </p>
                      )}
                      {event.preferredTime && (
                        <p className={`text-sm mt-1 flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-200`}>
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Heure recommandée: {event.preferredTime}
                        </p>
                      )}
                      {event.assignedBy && (
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-200`}>
                          Assigné par: {event.assignedBy.firstName || event.assignedBy.username}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      {event.isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      ) : (
                        <ClockIcon className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-200`}>
        <h5 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
          Légende:
        </h5>
        <div className="flex flex-wrap gap-4">
          {['sleep', 'exercise', 'screen', 'mood', 'stress', 'nutrition', 'other'].map((category) => (
            <div key={category} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)} mr-2`}></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserHabitCalendar;


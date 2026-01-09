import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  PencilIcon, 
  TrashIcon,
  MoonIcon,
  HeartIcon,
  ComputerDesktopIcon,
  FaceSmileIcon,
  FireIcon,
  CakeIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import HabitContext from '../../context/HabitContext';
import HabitForm from './HabitForm';

const HabitList = ({ habits }) => {
  const { deleteHabit } = useContext(HabitContext);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleEdit = (habit) => {
    setHabitToEdit(habit);
    setShowEditForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteHabit(id);
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sleep':
        return <MoonIcon className="h-5 w-5 text-indigo-500" />;
      case 'exercise':
        return <HeartIcon className="h-5 w-5 text-red-500" />;
      case 'screen':
        return <ComputerDesktopIcon className="h-5 w-5 text-blue-500" />;
      case 'mood':
        return <FaceSmileIcon className="h-5 w-5 text-yellow-500" />;
      case 'stress':
        return <FireIcon className="h-5 w-5 text-orange-500" />;
      case 'nutrition':
        return <CakeIcon className="h-5 w-5 text-green-500" />;
      default:
        return <QuestionMarkCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No habits found for the selected criteria.</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters or add a new habit.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Habit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {habits.map((habit) => (
              <motion.tr 
                key={habit._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getCategoryIcon(habit.category)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">
                      {habit.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{habit.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {habit.value} {habit.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(habit.date)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">
                    {habit.notes || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {confirmDelete === habit._id ? (
                    <div className="flex justify-end items-center space-x-2">
                      <span className="text-xs text-gray-500">Confirm?</span>
                      <button
                        onClick={() => handleDelete(habit._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(habit._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showEditForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <HabitForm 
              habitToEdit={habitToEdit} 
              onClose={() => {
                setShowEditForm(false);
                setHabitToEdit(null);
              }} 
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HabitList;

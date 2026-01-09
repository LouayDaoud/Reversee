import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import HabitContext from '../../context/HabitContext';
import AuthContext from '../../context/AuthContext';

const HabitForm = ({ habitToEdit, onClose, onHabitAdded }) => {
  const { addHabit, updateHabit } = useContext(HabitContext);
  const { token } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: habitToEdit ? {
      category: habitToEdit.category,
      name: habitToEdit.name,
      value: habitToEdit.value,
      unit: habitToEdit.unit,
      date: habitToEdit.date ? new Date(habitToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: habitToEdit.notes || ''
    } : {
      date: new Date().toISOString().split('T')[0]
    }
  });

  const categories = [
    { id: 'sleep', name: 'Sleep' },
    { id: 'exercise', name: 'Exercise' },
    { id: 'screen', name: 'Screen Time' },
    { id: 'mood', name: 'Mood' },
    { id: 'stress', name: 'Stress' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'other', name: 'Other' }
  ];

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (habitToEdit) {
        result = await updateHabit(habitToEdit._id, data);
      } else {
        result = await addHabit(data);
        // Call the callback with the newly added habit
        if (onHabitAdded && result) {
          onHabitAdded({
            ...data,
            _id: result._id || 'temp-id'
          });
        }
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save habit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          {habitToEdit ? 'Edit Habit' : 'Add New Habit'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              {...register('category', { required: 'Category is required' })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Habit Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { required: 'Habit name is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                type="number"
                id="value"
                step="0.01"
                {...register('value', {
                  required: 'Value is required',
                  valueAsNumber: true
                })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.value && (
                <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                type="text"
                id="unit"
                {...register('unit', { required: 'Unit is required' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="hours, steps, etc."
              />
              {errors.unit && (
                <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              {...register('date', { required: 'Date is required' })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : habitToEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitForm;

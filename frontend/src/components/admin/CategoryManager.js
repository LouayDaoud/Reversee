import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const CategoryManager = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'default-icon',
    color: '#6366F1'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Error fetching categories');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editMode) {
        await axios.put(`${API_URL}/categories/${currentCategoryId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${API_URL}/categories`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'Error saving category');
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color
    });
    setCurrentCategoryId(category._id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Error deleting category');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'default-icon',
      color: '#6366F1'
    });
    setEditMode(false);
    setCurrentCategoryId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Category Management</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Add, edit, and delete habit categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="color"
                    name="color"
                    id="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="h-8 w-8 rounded-md border border-gray-300 mr-2"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                {editMode ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="border-t border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories found.</p>
            <p className="text-gray-400 mt-2">Add a new category to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <motion.tr 
                    key={category._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full mr-3" style={{ backgroundColor: category.color }}></div>
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.color}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;

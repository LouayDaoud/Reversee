import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import {
  BeakerIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AdminHabitDNA = () => {
  const { token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [habitDNAs, setHabitDNAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAllHabitDNA();
  }, []);

  const fetchAllHabitDNA = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/habit-dna', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setHabitDNAs(response.data.data || []);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement');
      setLoading(false);
    }
  };

  const handleRegenerate = async (userId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/admin/habit-dna/${userId}/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        fetchAllHabitDNA();
        alert('Habit DNA régénéré avec succès');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la régénération');
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-dark-card' : 'bg-white'} rounded-lg shadow p-6 transition-colors duration-200`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
          <BeakerIcon className="inline-block w-6 h-6 mr-2" />
          Gestion des Habit DNA
        </h2>
        <button
          onClick={fetchAllHabitDNA}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'
          } text-white transition-colors duration-200`}
        >
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Utilisateur
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Séquence ADN
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-200' : 'text-gray-500'}`}>
                Composants
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
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                </td>
              </tr>
            ) : habitDNAs.length === 0 ? (
              <tr>
                <td colSpan="5" className={`px-6 py-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Aucun Habit DNA trouvé
                </td>
              </tr>
            ) : (
              habitDNAs.map((dna) => (
                <tr key={dna._id}>
                  <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {dna.user?.firstName || 'N/A'} {dna.user?.lastName || ''}
                    <br />
                    <span className="text-sm text-gray-500">{dna.user?.email || ''}</span>
                  </td>
                  <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <code className="text-xs font-mono bg-gray-900 text-green-400 px-2 py-1 rounded">
                      {dna.dnaSequence.substring(0, 20)}...
                    </code>
                  </td>
                  <td className={`px-6 py-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <div className="text-sm">
                      <div>C: {dna.components.consistency}%</div>
                      <div>D: {dna.components.diversity}%</div>
                      <div>I: {dna.components.intensity}%</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {dna.isPublic ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Privé
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    <button
                      onClick={() => handleRegenerate(dna.user._id || dna.user)}
                      className={`mr-3 ${theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-900'}`}
                      title="Régénérer"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedUser(dna)}
                      className={theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}
                      title="Voir détails"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Détails Habit DNA
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Séquence complète:</p>
                <code className="block text-xs font-mono bg-gray-900 text-green-400 p-3 rounded mt-1">
                  {selectedUser.dnaSequence}
                </code>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Composants:</p>
                  <ul className={`text-sm mt-2 space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Consistance: {selectedUser.components.consistency}%</li>
                    <li>Diversité: {selectedUser.components.diversity}%</li>
                    <li>Intensité: {selectedUser.components.intensity}%</li>
                    <li>Équilibre: {selectedUser.components.balance}%</li>
                    <li>Croissance: {selectedUser.components.growth}%</li>
                  </ul>
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Couleurs:</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded mr-2"
                        style={{ backgroundColor: selectedUser.colors.primary }}
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedUser.colors.primary}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded mr-2"
                        style={{ backgroundColor: selectedUser.colors.secondary }}
                      />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedUser.colors.secondary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHabitDNA;


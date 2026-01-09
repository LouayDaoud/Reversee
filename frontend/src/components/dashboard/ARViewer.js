import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import HabitContext from '../../context/HabitContext';
import arService from '../../services/arService';
import {
  XMarkIcon,
  CameraIcon,
  QrCodeIcon,
  PlayIcon,
  StopIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const ARViewer = ({ onClose }) => {
  const { theme } = useContext(ThemeContext);
  const { habits } = useContext(HabitContext);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [arObjects, setArObjects] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: arrêter la session AR si elle est active
      if (isActive && session) {
        endSession();
      }
    };
  }, [isActive, session]);

  const startARSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Créer une nouvelle session AR
      const response = await arService.createARSession({
        sessionType: 'habit_visualization',
        habits: habits.slice(0, 10).map(h => h._id), // Limiter à 10 habitudes
        config: {
          environment: 'indoor',
          lighting: 'natural',
          effects: {
            particles: true,
            shadows: true,
            animations: true
          }
        }
      });

      if (response.success) {
        setSession(response.data);
        setIsActive(true);
        initializeAR();
      }
      setLoading(false);
    } catch (err) {
      console.error('Error starting AR session:', err);
      setError(err.response?.data?.message || 'Erreur lors du démarrage de la session AR');
      setLoading(false);
    }
  };

  const initializeAR = async () => {
    // Note: Cette fonction devrait initialiser WebXR ou une bibliothèque AR
    // Pour l'instant, on simule avec un canvas
    try {
      // Vérifier si WebXR est disponible
      if (navigator.xr) {
        // WebXR est disponible - implémentation future
        console.log('WebXR disponible');
      } else {
        // Fallback: simulation avec canvas
        console.log('WebXR non disponible, utilisation du mode simulation');
        simulateAR();
      }
    } catch (err) {
      console.error('Error initializing AR:', err);
      // Fallback vers simulation
      simulateAR();
    }
  };

  const simulateAR = () => {
    // Simulation d'objets AR basés sur les habitudes
    const objects = habits.slice(0, 5).map((habit, index) => ({
      id: `habit-${habit._id}`,
      type: 'plant',
      position: {
        x: (index % 3) * 2 - 2,
        y: 0,
        z: Math.floor(index / 3) * 2 - 2
      },
      color: getCategoryColor(habit.category),
      metadata: {
        habitId: habit._id,
        habitName: habit.name,
        level: Math.floor(habit.value / 10) || 1
      }
    }));

    setArObjects(objects);
  };

  const getCategoryColor = (category) => {
    const colors = {
      sleep: '#3B82F6',
      exercise: '#10B981',
      screen: '#8B5CF6',
      mood: '#F59E0B',
      stress: '#EF4444',
      nutrition: '#F97316',
      other: '#6B7280'
    };
    return colors[category] || colors.other;
  };

  const endSession = async () => {
    if (!session) return;

    try {
      await arService.updateARSession(session._id, {
        endedAt: new Date(),
        stats: {
          duration: Math.floor((new Date() - new Date(session.startedAt)) / 1000),
          objectsCreated: arObjects.length,
          interactions: 0
        }
      });

      setIsActive(false);
    } catch (err) {
      console.error('Error ending AR session:', err);
    }
  };

  const captureScreenshot = async () => {
    if (!canvasRef.current) return;

    try {
      const dataURL = canvasRef.current.toDataURL('image/png');
      
      // Upload l'image (simulation - devrait utiliser un service de stockage)
      const response = await arService.addCapture(session._id, {
        url: dataURL,
        description: 'Capture AR'
      });

      if (response.success) {
        alert('Capture enregistrée avec succès!');
      }
    } catch (err) {
      console.error('Error capturing screenshot:', err);
      setError('Erreur lors de la capture');
    }
  };

  const generateQRCode = async () => {
    if (!habits || habits.length === 0) {
      setError('Aucune habitude disponible pour générer un QR code');
      return;
    }

    try {
      const response = await arService.generateQRCode({
        habitId: habits[0]._id,
        sessionId: session?._id
      });

      if (response.success) {
        alert(`QR Code généré: ${response.data.code}\nURL: ${response.data.url}`);
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Erreur lors de la génération du QR code');
    }
  };

  const toggleShare = async () => {
    if (!session) return;

    try {
      const response = await arService.toggleShare(session._id);
      if (response.success) {
        setSession(response.data);
        alert(response.data.isShared ? 'Session partagée!' : 'Partage annulé');
      }
    } catch (err) {
      console.error('Error toggling share:', err);
      setError('Erreur lors du partage');
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* AR Canvas Area */}
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}
        />

        {/* AR Objects Overlay (simulation) */}
        {isActive && arObjects.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {arObjects.map((obj, index) => (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="absolute"
                style={{
                  left: `${50 + obj.position.x * 10}%`,
                  top: `${50 + obj.position.y * 10}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: obj.color }}
                  title={obj.metadata.habitName}
                >
                  <span className="text-white font-bold text-xs">
                    {obj.metadata.level}
                  </span>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {obj.metadata.habitName}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
            <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Réalité Augmentée
            </h2>
            {!isActive && (
              <button
                onClick={startARSession}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                {loading ? 'Démarrage...' : 'Démarrer AR'}
              </button>
            )}
            {isActive && (
              <div className="space-y-2">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Session active - {arObjects.length} objets
                </p>
                <button
                  onClick={endSession}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  Arrêter
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {isActive && (
              <>
                <button
                  onClick={captureScreenshot}
                  className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  title="Capturer"
                >
                  <CameraIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={generateQRCode}
                  className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  title="Générer QR Code"
                >
                  <QrCodeIcon className="w-6 h-6 text-gray-700" />
                </button>
                <button
                  onClick={toggleShare}
                  className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  title={session?.isShared ? 'Partagé' : 'Partager'}
                >
                  <ShareIcon className={`w-6 h-6 ${session?.isShared ? 'text-indigo-600' : 'text-gray-700'}`} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Instructions */}
        {!isActive && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Instructions
              </h3>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Cliquez sur "Démarrer AR" pour commencer</li>
                <li>• Les objets AR représentent vos habitudes</li>
                <li>• Utilisez votre caméra pour voir les objets en AR</li>
                <li>• Capturez des screenshots de vos créations</li>
                <li>• Générez des QR codes pour déclencher des habitudes</li>
              </ul>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Note: WebXR n'est pas encore implémenté. Mode simulation activé.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARViewer;


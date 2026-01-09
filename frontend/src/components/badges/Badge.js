import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import ThemeContext from '../../context/ThemeContext';
import {
  AcademicCapIcon,
  FireIcon,
  TrophyIcon,
  StarIcon,
  SparklesIcon,
  HeartIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

const Badge = ({ badge, earned = false, progress = 0, onClick }) => {
  const { theme } = useContext(ThemeContext);
  
  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'trophy':
        return <TrophyIcon className="h-8 w-8" />;
      case 'fire':
        return <FireIcon className="h-8 w-8" />;
      case 'star':
        return <StarIcon className="h-8 w-8" />;
      case 'sparkles':
        return <SparklesIcon className="h-8 w-8" />;
      case 'heart':
        return <HeartIcon className="h-8 w-8" />;
      case 'lightbulb':
        return <LightBulbIcon className="h-8 w-8" />;
      case 'bolt':
        return <BoltIcon className="h-8 w-8" />;
      case 'academic':
      default:
        return <AcademicCapIcon className="h-8 w-8" />;
    }
  };
  
  const getBadgeColor = (color) => {
    switch (color) {
      case 'red':
        return earned ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-500';
      case 'green':
        return earned ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500';
      case 'yellow':
        return earned ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-500';
      case 'purple':
        return earned ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-500';
      case 'pink':
        return earned ? 'bg-pink-500 text-white' : 'bg-gray-300 text-gray-500';
      case 'indigo':
        return earned ? 'bg-indigo-500 text-white' : 'bg-gray-300 text-gray-500';
      case 'blue':
      default:
        return earned ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500';
    }
  };
  
  const getBadgeBorderColor = (color) => {
    switch (color) {
      case 'red':
        return earned ? 'border-red-300' : 'border-gray-200';
      case 'green':
        return earned ? 'border-green-300' : 'border-gray-200';
      case 'yellow':
        return earned ? 'border-yellow-300' : 'border-gray-200';
      case 'purple':
        return earned ? 'border-purple-300' : 'border-gray-200';
      case 'pink':
        return earned ? 'border-pink-300' : 'border-gray-200';
      case 'indigo':
        return earned ? 'border-indigo-300' : 'border-gray-200';
      case 'blue':
      default:
        return earned ? 'border-blue-300' : 'border-gray-200';
    }
  };
  
  const getLevelStars = (level) => {
    return Array(level).fill(0).map((_, i) => (
      <StarIcon key={i} className="h-3 w-3 text-yellow-400" />
    ));
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-lg shadow-md cursor-pointer ${
        theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
      } border-2 ${getBadgeBorderColor(badge.color)} transition-colors duration-200`}
    >
      {/* Badge Icon */}
      <div className={`rounded-full p-4 mb-3 ${getBadgeColor(badge.color)}`}>
        {getBadgeIcon(badge.icon)}
      </div>
      
      {/* Badge Name */}
      <h3 className={`text-sm font-bold mb-1 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {badge.name}
      </h3>
      
      {/* Badge Level */}
      <div className="flex items-center mb-2">
        {getLevelStars(badge.level)}
      </div>
      
      {/* Badge Description */}
      <p className={`text-xs text-center mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {badge.description}
      </p>
      
      {/* Progress Bar (only shown if not earned) */}
      {!earned && progress > 0 && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-blue-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {/* Locked Overlay */}
      {!earned && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg flex items-center justify-center">
          <div className={`text-xs font-medium px-2 py-1 rounded ${
            theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {progress > 0 ? `${Math.round(progress)}% complété` : 'Verrouillé'}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Badge;

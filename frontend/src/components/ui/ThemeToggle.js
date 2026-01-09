import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import ThemeContext from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <span className="sr-only">Toggle theme</span>
      <motion.div
        className={`absolute left-1 flex items-center justify-center w-4 h-4 rounded-full bg-white shadow-md`}
        animate={{
          x: theme === 'dark' ? 24 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {theme === 'dark' ? (
          <MoonIcon className="w-3 h-3 text-indigo-600" />
        ) : (
          <SunIcon className="w-3 h-3 text-yellow-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;

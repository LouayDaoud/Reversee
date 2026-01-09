import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import NotificationContext from '../../context/NotificationContext';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationCenter from '../notifications/NotificationCenter';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-600'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                Reversee
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        to="/admin"
                        className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Admin
                      </Link>
                    )}
                  </>
                )}
                <Link
                  to="/about"
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                <ThemeToggle />

                {isAuthenticated && <NotificationCenter />}

                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <div className="text-white text-sm">
                      <span className="mr-1">Hello,</span>
                      <span className="font-medium">{user?.firstName || 'User'}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className={`flex items-center text-white ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-700 hover:bg-indigo-800'} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className={`${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-indigo-600 hover:bg-gray-100'} px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
            <Link
              to="/about"
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
          <div className={`pt-4 pb-3 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-indigo-700'} transition-colors duration-200`}>
            {isAuthenticated ? (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-indigo-300'} transition-colors duration-200`}>
                    {user?.email}
                  </div>
                </div>
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </div>
            ) : (
              <div className="px-5 flex flex-col space-y-2">
                <div className="flex items-center mb-2">
                  <span className="text-white mr-2">Theme:</span>
                  <ThemeToggle />
                </div>
                <Link
                  to="/login"
                  className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-indigo-600 hover:bg-gray-100'} block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

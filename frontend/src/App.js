import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { HabitProvider } from './context/HabitContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { BadgeProvider } from './context/BadgeContext';
import { AnalysisProvider } from './context/AnalysisContext';
import Navbar from './components/layout/Navbar';
import Home from './components/pages/Home';
import About from './components/pages/About';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <ThemeProvider>
          <NotificationProvider>
            <BadgeProvider>
              <AnalysisProvider>
                <Router>
                  <div className="min-h-screen flex flex-col bg-theme">
                    <Navbar />
                    <div className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
                </Router>
              </AnalysisProvider>
            </BadgeProvider>
          </NotificationProvider>
        </ThemeProvider>
      </HabitProvider>
    </AuthProvider>
  );
}

export default App;

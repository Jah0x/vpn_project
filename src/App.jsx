import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import TelegramWarning from './components/Auth/TelegramWarning';
import LoginPage from './components/Auth/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import SubscriptionPage from './components/Subscription/SubscriptionPage';
import SettingsPage from './components/Settings/SettingsPage';
import AdminPanel from './components/Admin/AdminPanel';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoadingSpinner from './components/Common/LoadingSpinner';
import Toast from './components/Common/Toast';

// Проверка Telegram Web App
const isTelegramWebApp = () => {
  return window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData;
};

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Основной компонент приложения
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showTelegramWarning, setShowTelegramWarning] = useState(false);

  useEffect(() => {
    // Проверяем, если пользователь зашел через Telegram Web App
    if (isTelegramWebApp() && !isAuthenticated) {
      setShowTelegramWarning(true);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (showTelegramWarning) {
    return (
      <TelegramWarning 
        onContinue={() => setShowTelegramWarning(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {isAuthenticated && <Navbar />}
      
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          {/* Публичные маршруты */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage />
            } 
          />
          
          {/* Защищенные маршруты */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/subscription" 
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          
          {/* Редирект на главную */}
          <Route 
            path="/" 
            element={
              <Navigate 
                to={isAuthenticated ? "/dashboard" : "/login"} 
                replace 
              />
            } 
          />
          
          {/* 404 страница */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                  <p className="text-gray-400 mb-8">Страница не найдена</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="btn-primary"
                  >
                    Вернуться назад
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>
      </main>
      
      <Toast />
    </div>
  );
};

// Корневой компонент
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

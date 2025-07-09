import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import PromoBanner from './components/Layout/PromoBanner';
import TelegramWarning from './components/Auth/TelegramWarning';
import TelegramLogin from './components/Auth/telegram-login';
import LoginPage from './components/Auth/LoginPage';
import { LoginForm } from '@/features/auth/LoginForm';
import TgRedirect from '@/pages/TgRedirect';
import Dashboard from './components/Dashboard/Dashboard';
import Subscription from './pages/Subscription';
import SettingsPage from './components/Settings/SettingsPage';
import Pricing from './pages/Pricing';
import FaqPage from './pages/FaqPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import LoadingSpinner from './components/Common/LoadingSpinner';
import Toast from './components/Common/Toast';
import { getTelegram } from '@/shared/lib/telegram';

// Проверка Telegram Web App
const isTelegramWebApp = () => {
  const tg = getTelegram();
  return Boolean(tg && tg.initData);
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
  const navigate = useNavigate();

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
        onContinue={() => {
          setShowTelegramWarning(false);
          navigate('/telegram');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PromoBanner />

      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/tg-redirect" element={<TgRedirect />} />
          <Route path="/telegram" element={<TelegramLogin />} />
          
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
                <Subscription />
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

          <Route path="/pricing" element={<Pricing />} />

          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          
          
          {/* Редирект на главную */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
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

      <Footer />

      <Toast />
    </div>
  );
};

// Корневой компонент
const App = () => {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
};

export default App;

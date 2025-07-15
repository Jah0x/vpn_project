import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Footer from './components/Layout/Footer';
import PromoBanner from './components/Layout/PromoBanner';
import LoginPage from '@/pages/LoginPage';
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

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPromo, setShowPromo] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PromoBanner />

      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

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

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                  <p className="text-gray-400 mb-8">Страница не найдена</p>
                  <button onClick={() => window.history.back()} className="btn-primary">
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

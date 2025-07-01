// SettingsPage.jsx - Страница настроек пользователя

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  User, 
  Lock, 
  Shield, 
  Bell, 
  Globe, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { validateEmail, validatePassword } from '../../utils/validators';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    country: user?.country || 'RU',
    language: user?.language || 'ru'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: user?.twoFactorEnabled || false,
    loginNotifications: user?.loginNotifications !== false,
    sessionTimeout: user?.sessionTimeout || 30
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: user?.emailNotifications !== false,
    pushNotifications: user?.pushNotifications !== false,
    subscriptionAlerts: user?.subscriptionAlerts !== false,
    securityAlerts: user?.securityAlerts !== false
  });

  const tabs = [
    { id: 'profile', name: 'Профиль', icon: User },
    { id: 'security', name: 'Безопасность', icon: Shield },
    { id: 'notifications', name: 'Уведомления', icon: Bell },
    { id: 'preferences', name: 'Предпочтения', icon: Globe },
    { id: 'devices', name: 'Устройства', icon: Smartphone }
  ];

  const handleProfileSave = async () => {
    try {
      setLoading(true);
      
      // Валидация
      if (!profileData.name.trim()) {
        throw new Error('Имя не может быть пустым');
      }
      
      if (!validateEmail(profileData.email)) {
        throw new Error('Некорректный email');
      }

      // В реальном приложении - вызов API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateUser(profileData);
      showToast('Профиль успешно обновлен', 'success');
    } catch (error) {
      showToast(error.message || 'Ошибка обновления профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setLoading(true);
      
      // Валидация
      if (!passwordData.currentPassword) {
        throw new Error('Введите текущий пароль');
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Пароли не совпадают');
      }

      const passwordValidation = validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      // В реальном приложении - вызов API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      showToast('Пароль успешно изменен', 'success');
    } catch (error) {
      showToast(error.message || 'Ошибка смены пароля', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      setLoading(true);
      
      // В реальном приложении - вызов API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newState = !securitySettings.twoFactorEnabled;
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: newState }));
      
      showToast(
        `Двухфакторная аутентификация ${newState ? 'включена' : 'отключена'}`,
        'success'
      );
    } catch (error) {
      showToast('Ошибка изменения настроек 2FA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите удалить аккаунт? Это действие необратимо.'
    );
    
    if (!confirmed) return;

    try {
      setLoading(true);
      
      // В реальном приложении - вызов API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Аккаунт будет удален в течение 24 часов', 'info');
      await logout();
    } catch (error) {
      showToast('Ошибка удаления аккаунта', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      
      // В реальном приложении - генерация и скачивание данных
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        profile: profileData,
        subscription: user?.subscription,
        settings: {
          security: securitySettings,
          notifications: notificationSettings
        },
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vpn-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast('Данные экспортированы', 'success');
    } catch (error) {
      showToast('Ошибка экспорта данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Основная информация</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Полное имя
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Телефон
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+7 (999) 123-45-67"
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Страна
            </label>
            <select
              value={profileData.country}
              onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="RU">Россия</option>
              <option value="US">США</option>
              <option value="DE">Германия</option>
              <option value="FR">Франция</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleProfileSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? <LoadingSpinner size="small" /> : <Save className="w-4 h-4" />}
            <span>Сохранить изменения</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Смена пароля */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Смена пароля</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Текущий пароль
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Новый пароль
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Подтверждение пароля
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? <LoadingSpinner size="small" /> : <Lock className="w-4 h-4" />}
            <span>Изменить пароль</span>
          </button>
        </div>
      </div>

      {/* Двухфакторная аутентификация */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Двухфакторная аутентификация</h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h4 className="font-medium text-white">2FA аутентификация</h4>
            <p className="text-sm text-gray-400">Дополнительный уровень защиты аккаунта</p>
          </div>
          <button
            onClick={handleToggle2FA}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Опасная зона */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-red-400 mb-4">Опасная зона</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h4 className="font-medium text-white mb-2">Удаление аккаунта</h4>
            <p className="text-sm text-gray-400 mb-4">
              Это действие удалит ваш аккаунт и все связанные данные. Отменить это действие невозможно.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Удалить аккаунт</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">Настройки уведомлений</h3>
      
      <div className="space-y-4">
        {Object.entries({
          emailNotifications: 'Email уведомления',
          pushNotifications: 'Push уведомления',
          subscriptionAlerts: 'Уведомления о подписке',
          securityAlerts: 'Уведомления безопасности'
        }).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div>
              <h4 className="font-medium text-white">{label}</h4>
              <p className="text-sm text-gray-400">
                {key === 'securityAlerts' && 'Важные уведомления безопасности (рекомендуется)'}
                {key === 'subscriptionAlerts' && 'Уведомления об истечении подписки'}
                {key === 'emailNotifications' && 'Получать уведомления на email'}
                {key === 'pushNotifications' && 'Браузерные push-уведомления'}
              </p>
            </div>
            <button
              onClick={() => setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationSettings[key] ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationSettings[key] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white mb-4">Управление данными</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">Экспорт данных</h4>
          <p className="text-sm text-gray-400 mb-4">
            Скачайте копию всех ваших данных в формате JSON
          </p>
          <button
            onClick={exportData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Экспортировать</span>
          </button>
        </div>
        
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <h4 className="font-medium text-white mb-2">Очистка кэша</h4>
          <p className="text-sm text-gray-400 mb-4">
            Очистить локальные данные и кэш приложения
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              showToast('Кэш очищен', 'success');
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Очистить кэш</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Настройки</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Боковое меню */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'preferences' && renderDataTab()}
              {activeTab === 'devices' && (
                <div className="text-center py-8">
                  <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Управление устройствами будет доступно в следующей версии</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

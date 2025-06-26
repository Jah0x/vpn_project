import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Eye, EyeOff, Mail, User, Lock, Zap, Shield, Globe } from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import AuthService from '../../services/AuthService';

const LoginPage = () => {
  const { login, register, telegramAuth } = useAuth();
  const { showToast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTelegramForm, setShowTelegramForm] = useState(false);

  const [formData, setFormData] = useState({
    login: '',
    email: '',
    nickname: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Проверка наличия Telegram Web App
  const isTelegramWebApp = () => {
    return window.Telegram && window.Telegram.WebApp;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Очистка ошибок при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      if (!formData.login.trim()) {
        newErrors.login = 'Введите email или nickname';
      }
    } else {
      if (!formData.nickname.trim()) {
        newErrors.nickname = 'Введите nickname';
      } else if (!AuthService.validateNickname(formData.nickname)) {
        newErrors.nickname = 'Nickname должен содержать 3-50 символов (буквы, цифры, _)';
      }

      if (!formData.name.trim()) {
        newErrors.name = 'Введите имя';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Введите email';
      } else if (!AuthService.validateEmail(formData.email)) {
        newErrors.email = 'Введите корректный email';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Введите пароль';
    } else if (!isLogin) {
      const passwordValidation = AuthService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({
          login: formData.login,
          password: formData.password
        });
        showToast('Добро пожаловать!', 'success');
      } else {
        await register({
          nickname: formData.nickname,
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        showToast('Регистрация успешна!', 'success');
      }
    } catch (error) {
      showToast(error.message || 'Произошла ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramAuth = async () => {
    if (!isTelegramWebApp()) {
      showToast('Telegram Web App недоступен', 'error');
      return;
    }

    setLoading(true);

    try {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      if (!user) {
        showToast('Не удалось получить данные пользователя Telegram', 'error');
        return;
      }

      // Если пользователь новый, показываем форму дополнительных данных
      setShowTelegramForm(true);
      
    } catch (error) {
      showToast('Ошибка авторизации через Telegram', 'error');
    } finally {
      setLoading(false);
    }
  };

  const completeTelegramAuth = async (additionalData) => {
    setLoading(true);

    try {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;

      await telegramAuth(user, additionalData);
      showToast('Авторизация через Telegram успешна!', 'success');
    } catch (error) {
      showToast(error.message || 'Ошибка авторизации', 'error');
    } finally {
      setLoading(false);
      setShowTelegramForm(false);
    }
  };

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Защищенные соединения",
      description: "Военное шифрование"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Высокая скорость",
      description: "Без ограничений"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Все страны",
      description: "Глобальная сеть серверов"
    }
  ];

  if (showTelegramForm) {
    return (
      <TelegramAdditionalDataForm 
        onSubmit={completeTelegramAuth}
        onCancel={() => setShowTelegramForm(false)}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Левая часть - Форма */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {isLogin ? 'Добро пожаловать обратно!' : 'Создайте свой аккаунт'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поля для регистрации */}
            {!isLogin && (
              <>
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="nickname"
                      placeholder="Nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.nickname ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.nickname && <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>}
                </div>

                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Полное имя"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
              </>
            )}

            {/* Поле входа для авторизации */}
            {isLogin && (
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="login"
                    placeholder="Email или Nickname"
                    value={formData.login}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.login ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                </div>
                {errors.login && <p className="text-red-400 text-sm mt-1">{errors.login}</p>}
              </div>
            )}

            {/* Поле пароля */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Пароль"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Подтверждение пароля для регистрации */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Подтвердите пароль"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <span>{isLogin ? 'Войти' : 'Зарегистрироваться'}</span>
              )}
            </button>

            {/* Telegram авторизация */}
            {isTelegramWebApp() && (
              <button
                type="button"
                onClick={handleTelegramAuth}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Войти через Telegram</span>
              </button>
            )}

            {/* Переключение между формами */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    login: '',
                    email: '',
                    nickname: '',
                    name: '',
                    password: '',
                    confirmPassword: ''
                  });
                  setErrors({});
                }}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </form>

          {/* Тестовые данные для демонстрации */}
          <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
            <h3 className="text-white text-sm font-medium mb-2">Для тестирования:</h3>
            <p className="text-gray-400 text-xs">
              Логин: <span className="text-blue-400">admin</span><br />
              Пароль: <span className="text-blue-400">любой (мин. 6 символов)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Правая часть - Информация */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold text-white mb-4">
            Безопасный VPN
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Защитите свою приватность и получите доступ к контенту без ограничений
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="text-blue-400 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-medium">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент для дополнительных данных Telegram пользователей
const TelegramAdditionalDataForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = 'Введите желаемый nickname';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
    } else if (!AuthService.validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Введите пароль';
    } else {
      const passwordValidation = AuthService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Дополнительные данные
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Для завершения регистрации через Telegram нужно указать дополнительную информацию
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="login"
              placeholder="Желаемый nickname"
              value={formData.login}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.login ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.login && <p className="text-red-400 text-sm mt-1">{errors.login}</p>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Подтвердите пароль"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              }`}
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Завершить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

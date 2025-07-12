import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Lock, Zap, Shield, Globe } from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import { validateNickname, validateEmail, validatePassword } from '../../utils/validators';
import { getTelegram, isInTelegram } from '@/shared/lib/telegram';

const LoginPage = () => {
  const { login, register, telegramAuth } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Проверка наличия Telegram Web App
  const isTelegramWebApp = () => {
    if (!isInTelegram()) return false;
    return Boolean(getTelegram());
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
      if (!formData.email.trim()) {
        newErrors.email = 'Введите email';
      }
    } else {
      if (!formData.username.trim()) {
        newErrors.username = 'Введите username';
      } else if (!validateNickname(formData.username)) {
        newErrors.username = 'Username должен содержать 3-50 символов (буквы, цифры, _)';
      }

      if (!formData.name.trim()) {
        newErrors.name = 'Введите имя';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Введите email';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Введите корректный email';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Пароли не совпадают';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Введите пароль';
    } else if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
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
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.email, formData.username, formData.password);
      }

      if (result?.success) {
        navigate('/dashboard');
        showToast(
          isLogin ? 'Добро пожаловать!' : 'Регистрация успешна!',
          'success',
        );
      } else if (result?.error) {
        showToast(result.error, 'error');
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
      const tg = isInTelegram() ? getTelegram() : null;
      const initData = tg?.initData;

      if (!initData) {
        showToast('Не удалось получить данные пользователя Telegram', 'error');
        return;
      }

      await telegramAuth({ initData });
      showToast('Авторизация через Telegram успешна!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.message || 'Ошибка авторизации через Telegram', 'error');
    } finally {
      setLoading(false);
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
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.username ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
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
                    email: '',
                    username: '',
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


export default LoginPage;

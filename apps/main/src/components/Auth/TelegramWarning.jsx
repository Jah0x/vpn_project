import React, { useState } from 'react';
import { AlertTriangle, ExternalLink, Shield, Zap } from 'lucide-react';

const TelegramWarning = ({ onContinue }) => {
  const [showDetails, setShowDetails] = useState(false);

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Безопасность",
      description: "Ваши данные защищены шифрованием"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Быстрый доступ",
      description: "Мгновенная авторизация через Telegram"
    },
    {
      icon: <ExternalLink className="w-5 h-5" />,
      title: "Интеграция",
      description: "Полная интеграция с Telegram Bot"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
        {/* Иконка предупреждения */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Добро пожаловать!
        </h1>

        <p className="text-gray-300 text-center mb-6">
          Мы обнаружили, что вы используете Telegram Web App. 
          Для лучшего опыта мы рекомендуем использовать наш сервис.
        </p>

        {/* Особенности */}
        {showDetails && (
          <div className="space-y-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg">
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
        )}

        {/* Кнопки */}
        <div className="space-y-3">
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Продолжить в Telegram
          </button>

          <button
            onClick={() => window.open('https://your-vpn-service.com', '_blank')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Открыть в браузере</span>
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors duration-200"
          >
            {showDetails ? 'Скрыть детали' : 'Показать детали'}
          </button>
        </div>

        {/* Информация о боте */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-xs text-center">
            Этот сервис интегрирован с Telegram Bot для удобного управления VPN подключениями
          </p>
        </div>
      </div>
    </div>
  );
};

export default TelegramWarning;

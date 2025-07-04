import React from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PromoBanner = () => {
  const { user } = useAuth();
  const features = [
    { icon: '🔒', text: 'Шифрование военного уровня' },
    { icon: '🚫', text: 'Нет логирования' },
    { icon: '🚀', text: 'Скорость без лимитов' },
    { icon: '📺', text: 'YouTube без рекламы' },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:space-x-8">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Shield className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-white">VPN Service</span>
        </div>
        <p className="text-gray-400 mb-4 md:mb-0 md:mr-8">
          Быстрый и безопасный VPN без ограничений.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-6 flex-1">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2 md:mb-0">
              <span className="text-lg">{feature.icon}</span>
              <p className="text-gray-400 text-xs md:text-sm">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

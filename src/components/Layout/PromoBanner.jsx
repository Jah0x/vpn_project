import React from 'react';
import { Shield, Globe, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PromoBanner = () => {
  const { user } = useAuth();
  const features = [
    { icon: Shield, title: 'Безопасность', description: 'Шифрование военного уровня' },
    { icon: Globe, title: 'Глобальная сеть', description: '50+ серверов по всему миру' },
    { icon: MessageCircle, title: 'Поддержка 24/7', description: 'Всегда готовы помочь' },
  ];

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:space-x-8">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Shield className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-white">VPN Service</span>
        </div>
        <p className="text-gray-400 mb-4 md:mb-0 md:mr-8">
          Защитите свою конфиденциальность и получите доступ к интернету без ограничений
          с нашим надежным VPN-сервисом.
        </p>
        <div className="flex flex-col md:flex-row md:space-x-6 flex-1">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center space-x-2 mb-2 md:mb-0">
                <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{feature.title}</p>
                  <p className="text-gray-400 text-xs md:text-sm">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

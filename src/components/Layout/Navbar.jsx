import React from 'react';
import {
  Mail,
  Shield,
  Globe,
  Github,
  Twitter,
  Heart
} from 'lucide-react';
import { SiTelegram } from 'react-icons/si';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Возможности', href: '#features' },
      { name: 'Тарифы', href: '/subscription' },
      { name: 'Серверы', href: '#servers' },
      { name: 'Безопасность', href: '#security' }
    ],
    support: [
      { name: 'Помощь', href: '#help' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Связаться с нами', href: '#contact' },
      { name: 'Статус сервисов', href: '#status' }
    ],
    legal: [
      { name: 'Политика конфиденциальности', href: '#privacy' },
      { name: 'Условия использования', href: '#terms' },
      { name: 'Правила возврата', href: '#refund' },
      { name: 'Лицензия', href: '#license' }
    ],
    company: [
      { name: 'О нас', href: '#about' },
      { name: 'Блог', href: '#blog' },
      { name: 'Карьера', href: '#careers' },
      { name: 'Пресс-кит', href: '#press' }
    ]
  };

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/yourvpn',
      icon: Twitter,
      color: 'hover:text-blue-400'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/yourvpn',
      icon: Github,
      color: 'hover:text-gray-300'
    },
    {
      name: 'Email',
      href: 'mailto:support@yourvpn.com',
      icon: Mail,
      color: 'hover:text-green-400'
    },
    {
      name: 'Telegram',
      href: 'https://t.me/yourvpn',
      icon: SiTelegram,
      color: 'hover:text-blue-400'
    }
  ];

  const features = [
    { icon: '🔒', text: 'Шифрование военного уровня' },
    { icon: '🚫', text: 'Нет логирования' },
    { icon: '🚀', text: 'Скорость без лимитов' },
    { icon: '📺', text: 'YouTube без рекламы' }
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      {/* Основной контент футера */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Логотип и описание */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold text-white">VPN Service</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Быстрый и безопасный VPN без ограничений.
            </p>
            
            {/* Особенности */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-lg">{feature.icon}</span>
                  <p className="text-gray-400 text-xs">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ссылки */}
          <div>
            <h3 className="text-white font-semibold mb-4">Продукт</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Компания</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Подписка на новости */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-semibold mb-2">Подпишитесь на новости</h3>
              <p className="text-gray-400 text-sm">
                Получайте последние обновления о новых функциях и специальных предложениях
              </p>
            </div>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors text-sm font-medium">
                Подписаться
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Копирайт */}
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>© {currentYear} VPN Service. Сделано с</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>в России</span>
            </div>

            {/* Социальные сети */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Следите за нами:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 ${social.color} transition-colors`}
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Языки */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <select className="bg-transparent text-gray-400 text-sm focus:outline-none cursor-pointer">
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

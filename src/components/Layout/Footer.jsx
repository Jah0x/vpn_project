import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Политика конфиденциальности</a>
              <a href="#contact" className="text-gray-400 hover:text-white text-sm">Связаться с нами</a>
              <a href="/faq" className="text-gray-400 hover:text-white text-sm">FAQ</a>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              Защитите свою конфиденциальность и получите доступ к интернету без
              ограничений с нашим надежным VPN-сервисом.
            </div>
          </div>
          <div className="flex items-center justify-center mt-4 text-gray-400 text-sm space-x-1">
            <span>© {currentYear} VPN Service. Сделано с</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>в России</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

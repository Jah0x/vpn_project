// API конфигурация
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.vpn-service.com/v1',
  WEBSOCKET_URL: process.env.REACT_APP_WEBSOCKET_URL || 'wss://api.vpn-service.com/ws',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Конфигурация аутентификации
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 дней
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_RESET_TIMEOUT: 15 * 60 * 1000 // 15 минут
};

// Тарифы подписок
export const SUBSCRIPTION_PLANS = {
  '1month': {
    id: '1month',
    name: '1 месяц',
    duration: 30,
    price: 300,
    originalPrice: 400,
    discount: 25,
    features: [
      'Безлимитный трафик',
      'Доступ ко всем серверам',
      'Высокая скорость',
      'Техподдержка 24/7'
    ],
    popular: false
  },
  '3month': {
    id: '3month',
    name: '3 месяца',
    duration: 90,
    price: 800,
    originalPrice: 1200,
    discount: 33,
    features: [
      'Все возможности месячного плана',
      'Приоритетная поддержка',
      'Расширенная статистика',
      'Настройка DNS'
    ],
    popular: true
  },
  '6month': {
    id: '6month',
    name: '6 месяцев',
    duration: 180,
    price: 1400,
    originalPrice: 2400,
    discount: 42,
    features: [
      'Все возможности 3-месячного плана',
      'Персональный менеджер',
      'Приоритетные серверы',
      'Расширенная аналитика'
    ],
    popular: false
  },
  '12month': {
    id: '12month',
    name: '12 месяцев',
    duration: 365,
    price: 2400,
    originalPrice: 4800,
    discount: 50,
    features: [
      'Все возможности 6-месячного плана',
      'Максимальная экономия',
      'Эксклюзивные серверы',
      'Белый IP-адрес'
    ],
    popular: false
  }
};

// Статусы подписок
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
};

// Статусы серверов VPN
export const SERVER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
  OVERLOADED: 'overloaded'
};

// Протоколы VPN
export const VPN_PROTOCOLS = {
  WIREGUARD: {
    name: 'WireGuard',
    description: 'Современный и быстрый протокол',
    recommended: true
  },
  OPENVPN: {
    name: 'OpenVPN',
    description: 'Надежный и проверенный протокол',
    recommended: false
  },
  IKEV2: {
    name: 'IKEv2',
    description: 'Быстрый протокол для мобильных устройств',
    recommended: false
  }
};

// Страны и регионы серверов
export const SERVER_LOCATIONS = {
  'netherlands': {
    name: 'Нидерланды',
    flag: '🇳🇱',
    region: 'Европа',
    city: 'Амстердам'
  },
  'germany': {
    name: 'Германия',
    flag: '🇩🇪',
    region: 'Европа',
    city: 'Франкфурт'
  },
  'usa': {
    name: 'США',
    flag: '🇺🇸',
    region: 'Северная Америка',
    city: 'Нью-Йорк'
  },
  'singapore': {
    name: 'Сингапур',
    flag: '🇸🇬',
    region: 'Азия',
    city: 'Сингапур'
  },
  'japan': {
    name: 'Япония',
    flag: '🇯🇵',
    region: 'Азия',
    city: 'Токио'
  },
  'uk': {
    name: 'Великобритания',
    flag: '🇬🇧',
    region: 'Европа',
    city: 'Лондон'
  },
  'france': {
    name: 'Франция',
    flag: '🇫🇷',
    region: 'Европа',
    city: 'Париж'
  },
  'canada': {
    name: 'Канада',
    flag: '🇨🇦',
    region: 'Северная Америка',
    city: 'Торонто'
  }
};

// Типы уведомлений
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Роли пользователей
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

// Статусы платежей
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Способы оплаты
export const PAYMENT_METHODS = {
  CARD: {
    id: 'card',
    name: 'Банковская карта',
    icon: '💳',
    description: 'Visa, MasterCard, МИР'
  },
  QIWI: {
    id: 'qiwi',
    name: 'QIWI Кошелек',
    icon: '🥝',
    description: 'Оплата через QIWI'
  },
  YANDEX: {
    id: 'yandex',
    name: 'Яндекс.Деньги',
    icon: '🟡',
    description: 'ЮMoney (Яндекс.Деньги)'
  },
  WEBMONEY: {
    id: 'webmoney',
    name: 'WebMoney',
    icon: '💙',
    description: 'Электронная валюта'
  },
  CRYPTO: {
    id: 'crypto',
    name: 'Криптовалюта',
    icon: '₿',
    description: 'Bitcoin, Ethereum'
  },
  MOBILE: {
    id: 'mobile',
    name: 'Мобильный платеж',
    icon: '📱',
    description: 'Оплата с баланса телефона'
  }
};

// Типы купонов
export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_TRIAL: 'free_trial'
};

// Локализация
export const LOCALES = {
  RU: {
    code: 'ru',
    name: 'Русский',
    flag: '🇷🇺'
  },
  EN: {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  },
  DE: {
    code: 'de',
    name: 'Deutsch',
    flag: '🇩🇪'
  },
  FR: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  }
};

// Настройки приложения
export const APP_CONFIG = {
  NAME: 'VPN Service',
  VERSION: '1.0.0',
  DESCRIPTION: 'Быстрый и безопасный VPN сервис',
  SUPPORT_EMAIL: 'support@vpn-service.com',
  SUPPORT_TELEGRAM: '@vpn_service_support',
  WEBSITE: 'https://vpn-service.com',
  PRIVACY_POLICY: 'https://vpn-service.com/privacy',
  TERMS_OF_SERVICE: 'https://vpn-service.com/terms'
};

// Лимиты и ограничения
export const LIMITS = {
  MAX_DEVICES: 5,
  MAX_SESSIONS: 3,
  MAX_BANDWIDTH: 1000, // Мбит/с
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_USERNAME_LENGTH: 50,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8
};

// Интервалы обновления данных
export const UPDATE_INTERVALS = {
  CONNECTION_STATUS: 5000, // 5 секунд
  SERVER_STATUS: 30000, // 30 секунд
  USER_STATS: 60000, // 1 минута
  SUBSCRIPTION_CHECK: 300000, // 5 минут
  HEARTBEAT: 30000 // 30 секунд
};

// Статусы соединения
export const CONNECTION_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTING: 'disconnecting',
  ERROR: 'error'
};

// Коды ошибок
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  MAINTENANCE: 'MAINTENANCE'
};

// Регулярные выражения для валидации
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}$/,
  DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
};

// Темы приложения
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto'
};

// Размеры экранов для адаптивности
export const BREAKPOINTS = {
  XS: '480px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px'
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  SERVER_STATUS,
  VPN_PROTOCOLS,
  SERVER_LOCATIONS,
  NOTIFICATION_TYPES,
  USER_ROLES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  COUPON_TYPES,
  LOCALES,
  APP_CONFIG,
  LIMITS,
  UPDATE_INTERVALS,
  CONNECTION_STATUS,
  ERROR_CODES,
  VALIDATION_PATTERNS,
  THEMES,
  BREAKPOINTS
};

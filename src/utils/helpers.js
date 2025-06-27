import {
  VALIDATION_PATTERNS,
  SUBSCRIPTION_PLANS,
  SERVER_LOCATIONS,
} from "./constants";

// Утилиты для работы с датами
export const DateUtils = {
  // Форматирование даты для отображения
  formatDate(date, locale = "ru-RU", options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    };
    return new Date(date).toLocaleDateString(locale, defaultOptions);
  },

  // Форматирование даты и времени
  formatDateTime(date, locale = "ru-RU") {
    return new Date(date).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Относительное время (например, "2 часа назад")
  timeAgo(date, locale = "ru-RU") {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return rtf.format(-interval, unit);
      }
    }

    return rtf.format(-diffInSeconds, "second");
  },

  // Добавление дней к дате
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Проверка истечения даты
  isExpired(date) {
    return new Date(date) < new Date();
  },

  // Дни до истечения
  daysUntilExpiry(date) {
    const now = new Date();
    const expiry = new Date(date);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};

// Утилиты для форматирования
export const FormatUtils = {
  // Форматирование цены
  formatPrice(amount, currency = "RUB", locale = "ru-RU") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  // Форматирование чисел
  formatNumber(number, locale = "ru-RU") {
    return new Intl.NumberFormat(locale).format(number);
  },

  // Форматирование размера файла
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Форматирование скорости
  formatSpeed(bitsPerSecond) {
    const units = ["bps", "Kbps", "Mbps", "Gbps"];
    let unitIndex = 0;
    let speed = bitsPerSecond;

    while (speed >= 1000 && unitIndex < units.length - 1) {
      speed /= 1000;
      unitIndex++;
    }

    return `${speed.toFixed(1)} ${units[unitIndex]}`;
  },

  // Форматирование времени
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
  },

  // Маскирование email
  maskEmail(email) {
    const [name, domain] = email.split("@");
    const maskedName =
      name.length > 2
        ? name[0] + "*".repeat(name.length - 2) + name[name.length - 1]
        : name;
    return `${maskedName}@${domain}`;
  },

  // Маскирование телефона
  maskPhone(phone) {
    return phone.replace(
      /(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/,
      "$1***$2***$4$5",
    );
  },
};

// Утилиты для валидации
export const ValidationUtils = {
  // Валидация email
  isValidEmail(email) {
    return VALIDATION_PATTERNS.EMAIL.test(email);
  },

  // Валидация телефона
  isValidPhone(phone) {
    return VALIDATION_PATTERNS.PHONE.test(phone);
  },

  // Валидация пароля
  validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push("Пароль должен содержать минимум 8 символов");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Пароль должен содержать строчные буквы");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Пароль должен содержать заглавные буквы");
    }

    if (!/\d/.test(password)) {
      errors.push("Пароль должен содержать цифры");
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push("Пароль должен содержать специальные символы");
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.getPasswordStrength(password),
    };
  },

  // Определение силы пароля
  getPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    if (password.length >= 16) score++;

    if (score <= 2) return "weak";
    if (score <= 4) return "medium";
    return "strong";
  },

  // Валидация имени пользователя
  isValidUsername(username) {
    return VALIDATION_PATTERNS.USERNAME.test(username);
  },
};

// Утилиты для работы с цветами
export const ColorUtils = {
  // Генерация случайного цвета
  randomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  },

  // Конвертация HEX в RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Определение контрастности цвета
  getContrastColor(hex) {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return "#000000";

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  },
};

// Утилиты для работы с URL
export const UrlUtils = {
  // Получение параметров из URL
  getUrlParams() {
    return new URLSearchParams(window.location.search);
  },

  // Получение конкретного параметра
  getUrlParam(name) {
    return this.getUrlParams().get(name);
  },

  // Создание URL с параметрами
  buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  },

  // Проверка валидности URL
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },
};

// Утилиты для работы с массивами
export const ArrayUtils = {
  // Группировка массива по ключу
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  },

  // Удаление дубликатов
  unique(array, key = null) {
    if (key) {
      const seen = new Set();
      return array.filter((item) => {
        const value = item[key];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  },

  // Сортировка по нескольким полям
  sortBy(array, ...fields) {
    return array.sort((a, b) => {
      for (const field of fields) {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  },

  // Разбиение массива на чанки
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
};

// Утилиты для работы с объектами
export const ObjectUtils = {
  // Глубокое клонирование
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Глубокое слияние объектов
  deepMerge(target, source) {
    const output = { ...target };

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  },

  // Проверка на объект
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  },

  // Получение вложенного значения
  get(obj, path, defaultValue = undefined) {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result == null || typeof result !== "object") {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  },
};

// Утилиты для работы со строками
export const StringUtils = {
  // Капитализация первой буквы
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Преобразование в camelCase
  toCamelCase(str) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  },

  // Преобразование в kebab-case
  toKebabCase(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  },

  // Усечение строки
  truncate(str, length, suffix = "...") {
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  },

  // Генерация случайной строки
  randomString(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};

// Утилиты для работы с подписками
export const SubscriptionUtils = {
  // Получение информации о тарифе
  getPlanInfo(planId) {
    return SUBSCRIPTION_PLANS[planId] || null;
  },

  // Расчет скидки
  calculateDiscount(originalPrice, discountedPrice) {
    return Math.round(
      ((originalPrice - discountedPrice) / originalPrice) * 100,
    );
  },

  // Расчет стоимости в месяц
  getMonthlyPrice(planId) {
    const plan = this.getPlanInfo(planId);
    if (!plan) return 0;
    return Math.round(plan.price / (plan.duration / 30));
  },

  // Проверка активности подписки
  isActive(subscription) {
    if (!subscription) return false;
    return (
      subscription.status === "active" &&
      new Date(subscription.expiresAt) > new Date()
    );
  },

  // Дни до истечения подписки
  getDaysUntilExpiry(subscription) {
    if (!subscription || !subscription.expiresAt) return 0;
    return DateUtils.daysUntilExpiry(subscription.expiresAt);
  },
};

// Утилиты для работы с серверами
export const ServerUtils = {
  // Получение информации о локации
  getLocationInfo(locationId) {
    return SERVER_LOCATIONS[locationId] || null;
  },

  // Группировка серверов по регионам
  groupByRegion(servers) {
    return ArrayUtils.groupBy(servers, "region");
  },

  // Сортировка серверов по пингу
  sortByPing(servers) {
    return servers.sort((a, b) => (a.ping || 999) - (b.ping || 999));
  },

  // Фильтрация онлайн серверов
  getOnlineServers(servers) {
    return servers.filter((server) => server.status === "online");
  },
};

// Утилиты для работы с localStorage
export const StorageUtils = {
  // Сохранение в localStorage с проверкой
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Ошибка сохранения в localStorage:", error);
      return false;
    }
  },

  // Получение из localStorage с проверкой
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Ошибка чтения из localStorage:", error);
      return defaultValue;
    }
  },

  // Удаление из localStorage
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Ошибка удаления из localStorage:", error);
      return false;
    }
  },

  // Очистка localStorage
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Ошибка очистки localStorage:", error);
      return false;
    }
  },
};

// Экспорт всех утилит
export default {
  DateUtils,
  FormatUtils,
  ValidationUtils,
  ColorUtils,
  UrlUtils,
  ArrayUtils,
  ObjectUtils,
  StringUtils,
  SubscriptionUtils,
  ServerUtils,
  StorageUtils,
};

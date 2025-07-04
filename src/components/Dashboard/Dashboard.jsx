import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Wifi, 
  Download, 
  Upload, 
  Clock, 
  Users, 
  Server, 
  Activity,
  QrCode,
  Copy,
  ClipboardCopy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import VPNService from '../../services/VPNService';
import MonitoringService from '../../services/MonitoringService';
import { useToast } from '../../contexts/ToastContext';
import Button from '../ui/Button';

const Dashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [vpnConfig, setVpnConfig] = useState(null);
  const [serverStats, setServerStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [configData, statsData, userStatsData] = await Promise.all([
        VPNService.getConfig(),
        MonitoringService.getServerStats(),
        MonitoringService.getUserStats()
      ]);

      setVpnConfig(configData);
      setServerStats(statsData);
      setUserStats(userStatsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyConfig = () => {
    if (vpnConfig?.config_url) {
      navigator.clipboard.writeText(vpnConfig.config_url);
      showToast('Конфигурация скопирована!', 'success');
    }
  };

  const handleCopySubLink = async () => {
    try {
      const res = await fetch('/api/subscription-url');
      if (res.ok) {
        const data = await res.json();
        await navigator.clipboard.writeText(data.url);
        showToast('Ссылка скопирована', 'success');
      }
    } catch {
      showToast('Ошибка получения ссылки', 'error');
    }
  };

  const handleRegenerateConfig = async () => {
    try {
      setConfigLoading(true);
      const newConfig = await VPNService.regenerateConfig();
      setVpnConfig(newConfig);
      showToast('Конфигурация обновлена!', 'success');
    } catch (error) {
      showToast('Ошибка обновления конфигурации', 'error');
    } finally {
      setConfigLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Проверяем статус подписки
  const hasActiveSubscription = user?.subscription?.active;

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Добро пожаловать, {user?.name}!
          </h1>
          <p className="text-gray-400">
            Управляйте своим VPN подключением и отслеживайте статистику
          </p>
        </div>

        {/* Статус подписки */}
        <div className="mb-8">
          {hasActiveSubscription ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Подписка активна</p>
                <p className="text-green-300 text-sm">
                  Действует до: {new Date(user.subscription.expires_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="ml-auto flex space-x-2">
                <button
                  onClick={handleCopySubLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center"
                >
                  <ClipboardCopy className="w-4 h-4 mr-1" />Копировать ссылку
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-medium">Подписка неактивна</p>
                  <p className="text-red-300 text-sm">Для доступа к VPN нужно активировать подписку</p>
                </div>
              </div>
              <Button onClick={() => window.location.href = '/subscription'}>
                Выбрать тариф
              </Button>
            </div>
          )}
        </div>

        {/* Основная сетка */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* VPN Конфигурация */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Wifi className="w-5 h-5" />
                    <span>VPN Конфигурация</span>
                  </h2>
                  {hasActiveSubscription && (
                    <Button onClick={handleRegenerateConfig} isLoading={configLoading} className="px-3 py-1.5 text-sm">
                      <RefreshCw className="w-4 h-4" />
                      <span>Обновить</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {hasActiveSubscription ? (
                  vpnConfig ? (
                    <div className="space-y-6">
                      {/* QR код */}
                      {vpnConfig.qr_code && (
                        <div className="flex justify-center">
                          <div className="bg-white p-4 rounded-lg">
                            <img 
                              src={vpnConfig.qr_code} 
                              alt="VPN QR Code"
                              className="w-32 h-32"
                            />
                          </div>
                        </div>
                      )}

                      {/* Конфигурационная строка */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Конфигурация для импорта:
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={vpnConfig.config_url || ''}
                            readOnly
                            className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm font-mono"
                          />
                          <button
                            onClick={handleCopyConfig}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Информация о сервере */}
                      {vpnConfig.server_info && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Сервер:</span>
                            <p className="text-white font-medium">{vpnConfig.server_info.endpoint}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Порт:</span>
                            <p className="text-white font-medium">{vpnConfig.server_info.port}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Протокол:</span>
                            <p className="text-white font-medium">{vpnConfig.server_info.protocol.toUpperCase()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">UUID:</span>
                            <p className="text-white font-medium font-mono text-xs">{vpnConfig.server_info.uuid}</p>
                          </div>
                        </div>
                      )}

                      {/* Инструкции */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <h3 className="text-blue-400 font-medium mb-2">Как подключиться:</h3>
                        <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
                          <li>Скачайте приложение v2rayNG (Android) или v2rayN (Windows)</li>
                          <li>Отсканируйте QR-код или скопируйте конфигурацию</li>
                          <li>Импортируйте конфигурацию в приложение</li>
                          <li>Подключитесь к серверу</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wifi className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Загрузка конфигурации...</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Конфигурация недоступна</p>
                    <p className="text-gray-500 text-sm">Для получения конфигурации необходима активная подписка</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Статистика пользователя */}
          <div className="space-y-6">
            {/* Трафик за сегодня */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Трафик сегодня</span>
              </h3>
              
              {userStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Загружено</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatBytes(userStats.traffic.upload_mb * 1024 * 1024)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400">Скачано</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatBytes(userStats.traffic.download_mb * 1024 * 1024)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-400">Время подключения</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatDuration(userStats.connection_time_minutes)}
                    </span>
                  </div>
                  
                  {userStats.last_connection && (
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-sm">Последнее подключение:</span>
                      <p className="text-white text-sm">
                        {new Date(userStats.last_connection).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>

            {/* Статус серверов */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Статус серверов</span>
              </h3>
              
              {serverStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Загрузка сервера</span>
                    <span className="text-white font-medium">{serverStats.server_load}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${serverStats.server_load}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">Активные пользователи</span>
                    </div>
                    <span className="text-white font-medium">{serverStats.active_users}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Пропускная способность</span>
                    <span className="text-white font-medium">{serverStats.bandwidth_gbps} Гб/с</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Время работы</span>
                    <span className="text-green-400 font-medium">{serverStats.uptime_percent}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <LoadingSpinner size="small" />
                </div>
              )}
            </div>

            {/* Ссылки */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Полезные ссылки</h3>
              
              <div className="space-y-3">
                <a
                  href="https://github.com/2dust/v2rayNG/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>v2rayNG для Android</span>
                </a>
                
                <a
                  href="https://github.com/2dust/v2rayN/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>v2rayN для Windows</span>
                </a>
                
                <a
                  href="/subscription"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Управление подпиской</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

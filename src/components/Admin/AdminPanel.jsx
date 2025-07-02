// AdminPanel.jsx - Административная панель

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  Users, 
  CreditCard, 
  Server, 
  Activity,
  Settings,
  Gift,
  BarChart3,
  TrendingUp,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import MonitoringService from '../../services/MonitoringService';
import SubscriptionService from '../../services/SubscriptionService';
import CouponService from '../../services/CouponService';

const AdminPanel = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: BarChart3 },
    { id: 'users', name: 'Пользователи', icon: Users },
    { id: 'subscriptions', name: 'Подписки', icon: CreditCard },
    { id: 'servers', name: 'Серверы', icon: Server },
    { id: 'coupons', name: 'Купоны', icon: Gift },
    { id: 'settings', name: 'Настройки', icon: Settings }
  ];

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      showToast('Доступ запрещен', 'error');
      return;
    }
    loadAdminData();
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsData, usersData, subscriptionsData, couponsData] = await Promise.all([
        getAdminStats(),
        getUsers(),
        getSubscriptions(),
        getCoupons()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setSubscriptions(subscriptionsData);
      setCoupons(couponsData);
    } catch (error) {
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAdminStats = async () => {
    // Mock данные админской статистики
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      totalUsers: 1247,
      activeSubscriptions: 892,
      totalRevenue: 2456780,
      monthlyRevenue: 186420,
      serverUptime: 99.9,
      supportTickets: 23,
      newUsers: {
        today: 12,
        week: 89,
        month: 342
      },
      revenueGrowth: 15.3,
      churnRate: 2.1
    };
  };

  const getUsers = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        id: 1,
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        role: 'user',
        subscription: { active: true, type: '3month' },
        registeredAt: '2025-05-15T10:00:00Z',
        lastActive: '2025-06-25T15:30:00Z'
      },
      {
        id: 2,
        name: 'Мария Петрова',
        email: 'maria@example.com',
        role: 'user',
        subscription: { active: false, type: null },
        registeredAt: '2025-06-20T14:20:00Z',
        lastActive: '2025-06-26T09:15:00Z'
      }
    ];
  };

  const getSubscriptions = async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 1,
        userId: 1,
        type: '3month',
        status: 'active',
        amount: 800,
        createdAt: '2025-05-15T10:00:00Z',
        expiresAt: '2025-08-15T10:00:00Z'
      },
      {
        id: 2,
        userId: 2,
        type: '1month',
        status: 'expired',
        amount: 300,
        createdAt: '2025-05-20T12:00:00Z',
        expiresAt: '2025-06-20T12:00:00Z'
      }
    ];
  };

  const getCoupons = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        code: 'SUMMER2025',
        discount: 20,
        type: 'percentage',
        used: 67,
        maxUses: 100,
        active: true,
        expiresAt: '2025-08-31T23:59:59Z'
      },
      {
        code: 'NEWUSER',
        discount: 50,
        type: 'percentage',
        used: 23,
        maxUses: 50,
        active: true,
        expiresAt: '2025-12-31T23:59:59Z'
      }
    ];
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* KPI карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Всего пользователей</p>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              <p className="text-green-400 text-sm">+{stats?.newUsers?.month || 0} за месяц</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Активные подписки</p>
              <p className="text-2xl font-bold text-white">{stats?.activeSubscriptions || 0}</p>
              <p className="text-green-400 text-sm">Конверсия 71%</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Доход за месяц</p>
              <p className="text-2xl font-bold text-white">
                {stats?.monthlyRevenue?.toLocaleString('ru-RU') || 0}₽
              </p>
              <p className="text-green-400 text-sm">+{stats?.revenueGrowth || 0}%</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Uptime серверов</p>
              <p className="text-2xl font-bold text-white">{stats?.serverUptime || 0}%</p>
              <p className="text-green-400 text-sm">Отлично</p>
            </div>
            <Server className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Последняя активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Последние регистрации</h3>
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(user.registeredAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Активные купоны</h3>
          <div className="space-y-3">
            {coupons.filter(c => c.active).map((coupon) => (
              <div key={coupon.code} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{coupon.code}</p>
                  <p className="text-gray-400 text-sm">
                    {coupon.discount}{coupon.type === 'percentage' ? '%' : '₽'} скидка
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">{coupon.used}/{coupon.maxUses}</p>
                  <div className="w-20 bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(coupon.used / coupon.maxUses) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Управление пользователями</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          Экспорт данных
        </button>
      </div>

      <div className="bg-gray-700/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Подписка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Регистрация
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Последняя активность
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription?.active ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {user.subscription.type}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Неактивна
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.registeredAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.lastActive).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Редактировать</button>
                    <button className="text-red-400 hover:text-red-300">Заблокировать</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCouponsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Управление купонами</h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          Создать купон
        </button>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <div key={coupon.code} className="bg-gray-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-white">{coupon.code}</h4>
                <p className="text-gray-400">
                  Скидка {coupon.discount}{coupon.type === 'percentage' ? '%' : '₽'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white">{coupon.used} / {coupon.maxUses}</p>
                  <p className="text-gray-400 text-sm">использований</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${coupon.active ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all" 
                  style={{ width: `${(coupon.used / coupon.maxUses) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-gray-400 text-sm">
                Истекает: {new Date(coupon.expiresAt).toLocaleDateString('ru-RU')}
              </span>
              <div className="space-x-2">
                <button className="text-blue-400 hover:text-blue-300 text-sm">Редактировать</button>
                <button className="text-red-400 hover:text-red-300 text-sm">Деактивировать</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h1>
          <p className="text-gray-400">У вас нет прав для просмотра этой страницы</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
        <LoadingSpinner size="large" message="Загрузка админ панели..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Панель администратора</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Система работает</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Боковое меню */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden lg:block">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Основной контент */}
          <div className="lg:col-span-5">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'users' && renderUsersTab()}
              {activeTab === 'coupons' && renderCouponsTab()}
              {activeTab === 'subscriptions' && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Управление подписками в разработке</p>
                </div>
              )}
              {activeTab === 'servers' && (
                <div className="text-center py-8">
                  <Server className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Мониторинг серверов в разработке</p>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Настройки системы в разработке</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

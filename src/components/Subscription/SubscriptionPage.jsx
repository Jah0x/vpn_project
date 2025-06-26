import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Crown, 
  Star,
  CreditCard,
  Gift,
  Calendar,
  RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../Common/LoadingSpinner';
import SubscriptionService from '../../services/SubscriptionService';
import PaymentService from '../../services/PaymentService';
import CouponService from '../../services/CouponService';

const SubscriptionPage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      const [plansData, subscriptionData] = await Promise.all([
        SubscriptionService.getPlans(),
        SubscriptionService.getCurrentSubscription()
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error('Ошибка загрузки данных подписки:', error);
      showToast('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCouponCheck = async () => {
    if (!couponCode.trim()) {
      setCouponDiscount(null);
      return;
    }

    try {
      setCouponLoading(true);
      const couponData = await CouponService.validateCoupon(couponCode);
      setCouponDiscount(couponData);
      showToast(`Купон применен! Скидка ${couponData.discount}%`, 'success');
    } catch (error) {
      setCouponDiscount(null);
      showToast(error.message || 'Купон недействителен', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePurchase = async (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const completePurchase = async (paymentMethod) => {
    if (!selectedPlan) return;

    try {
      setPurchasing(selectedPlan.id);
      
      // Создаем заявку на подписку
      const subscriptionData = await SubscriptionService.createPurchase(selectedPlan.id, couponCode);
      
      // Обрабатываем платеж
      const paymentData = await PaymentService.processPayment({
        subscription_id: subscriptionData.subscription_id,
        payment_method: paymentMethod,
        return_url: window.location.origin + '/subscription'
      });

      if (paymentData.payment_url) {
        // Перенаправляем на платежную систему
        window.location.href = paymentData.payment_url;
      } else {
        // Платеж прошел успешно
        showToast('Подписка успешно активирована!', 'success');
        await loadSubscriptionData();
        
        // Обновляем данные пользователя
        updateUser({
          subscription: {
            active: true,
            type: selectedPlan.id,
            expires_at: new Date(Date.now() + selectedPlan.duration_days * 24 * 60 * 60 * 1000).toISOString()
          }
        });
      }
    } catch (error) {
      showToast(error.message || 'Ошибка при покупке подписки', 'error');
    } finally {
      setPurchasing(null);
      setShowPaymentModal(false);
      setSelectedPlan(null);
    }
  };

  const calculateDiscountedPrice = (price) => {
    if (!couponDiscount) return price;
    return Math.round(price * (1 - couponDiscount.discount / 100));
  };

  const getPlanIcon = (planId) => {
    const icons = {
      '1month': <Zap className="w-6 h-6" />,
      '3month': <Shield className="w-6 h-6" />,
      '6month': <Globe className="w-6 h-6" />,
      '12month': <Crown className="w-6 h-6" />
    };
    return icons[planId] || <Star className="w-6 h-6" />;
  };

  const getPlanColor = (planId) => {
    const colors = {
      '1month': 'border-blue-500 bg-blue-500/10',
      '3month': 'border-green-500 bg-green-500/10',
      '6month': 'border-purple-500 bg-purple-500/10',
      '12month': 'border-yellow-500 bg-yellow-500/10'
    };
    return colors[planId] || 'border-gray-500 bg-gray-500/10';
  };

  const isPlanActive = (planId) => {
    return currentSubscription?.type === planId && currentSubscription?.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-16 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Выберите свой тарифный план
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Получите полный доступ к быстрому и безопасному VPN сервису
          </p>
        </div>

        {/* Текущая подписка */}
        {currentSubscription && currentSubscription.active && (
          <div className="mb-8 bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Активная подписка</h3>
                  <p className="text-gray-400">
                    Тариф: {plans.find(p => p.id === currentSubscription.type)?.name || currentSubscription.type}
                  </p>
                  <p className="text-gray-400">
                    Действует до: {new Date(currentSubscription.expires_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={loadSubscriptionData}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Обновить</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Купон */}
        <div className="mb-8 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>Промокод</span>
          </h3>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Введите промокод"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleCouponCheck}
              disabled={couponLoading || !couponCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              {couponLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>Применить</span>
                </>
              )}
            </button>
          </div>

          {couponDiscount && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                ✓ Промокод применен! Скидка: {couponDiscount.discount}%
              </p>
            </div>
          )}

          {/* Демо купоны */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm mb-2">Для тестирования:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCouponCode('SUMMER2025')}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 rounded text-xs transition-colors"
              >
                SUMMER2025 (-20%)
              </button>
              <button
                onClick={() => setCouponCode('NEWUSER')}
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 rounded text-xs transition-colors"
              >
                NEWUSER (-50%)
              </button>
            </div>
          </div>
        </div>

        {/* Тарифные планы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const isActive = isPlanActive(plan.id);
            const originalPrice = plan.price;
            const discountedPrice = calculateDiscountedPrice(originalPrice);
            const isPurchasing = purchasing === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-gray-800 rounded-xl border-2 overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isActive 
                    ? 'border-green-500 bg-green-500/10' 
                    : getPlanColor(plan.id)
                }`}
              >
                {/* Популярный план */}
                {plan.savings > 0 && !isActive && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-white px-3 py-1 text-xs font-medium">
                    Выгодно
                  </div>
                )}

                {/* Активная подписка */}
                {isActive && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium">
                    Активен
                  </div>
                )}

                <div className="p-6">
                  {/* Иконка и название */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-4 text-blue-400">
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-center">
                      {couponDiscount && discountedPrice !== originalPrice ? (
                        <div>
                          <span className="text-2xl font-bold text-white">{discountedPrice}₽</span>
                          <span className="text-lg text-gray-400 line-through ml-2">{originalPrice}₽</span>
                          <p className="text-green-400 text-sm">Скидка {originalPrice - discountedPrice}₽</p>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-white">{originalPrice}₽</span>
                      )}
                    </div>
                    {plan.savings > 0 && (
                      <p className="text-green-400 text-sm">Экономия {plan.savings}₽</p>
                    )}
                  </div>

                  {/* Особенности */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Кнопка */}
                  <button
                    onClick={() => handlePurchase(plan)}
                    disabled={isActive || isPurchasing}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      isActive 
                        ? 'bg-green-600 text-white cursor-default'
                        : isPurchasing
                          ? 'bg-gray-600 text-white cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isPurchasing ? (
                      <LoadingSpinner size="small" />
                    ) : isActive ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Активен</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Выбрать план</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Преимущества */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Что вы получаете
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Военное шифрование</h3>
              <p className="text-gray-400">AES-256 шифрование для защиты ваших данных</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Высокая скорость</h3>
              <p className="text-gray-400">Безлимитный трафик без ограничений скорости</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Глобальная сеть</h3>
              <p className="text-gray-400">Серверы в разных странах мира</p>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно платежа */}
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          discountedPrice={calculateDiscountedPrice(selectedPlan.price)}
          originalPrice={selectedPlan.price}
          couponDiscount={couponDiscount}
          onConfirm={completePurchase}
          onCancel={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};

// Модальное окно выбора способа оплаты
const PaymentModal = ({ plan, discountedPrice, originalPrice, couponDiscount, onConfirm, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Банковская карта', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'qiwi', name: 'QIWI', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'yoomoney', name: 'ЮMoney', icon: <CreditCard className="w-5 h-5" /> }
  ];

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirm(selectedMethod);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-6">Оплата подписки</h3>
        
        {/* Детали заказа */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-2">Детали заказа:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Тариф:</span>
              <span className="text-white">{plan.name}</span>
            </div>
            {couponDiscount && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Цена:</span>
                  <span className="text-gray-400 line-through">{originalPrice}₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Скидка:</span>
                  <span className="text-green-400">-{couponDiscount.discount}%</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-medium">
              <span className="text-white">К оплате:</span>
              <span className="text-white">{discountedPrice}₽</span>
            </div>
          </div>
        </div>

        {/* Способы оплаты */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Способ оплаты:</h4>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="sr-only"
                />
                <div className="text-blue-400">
                  {method.icon}
                </div>
                <span className="text-white">{method.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={processing}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {processing ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Оплатить {discountedPrice}₽</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

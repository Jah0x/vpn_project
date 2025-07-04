import React from 'react';
import Spinner from '../components/ui/Spinner';
import PlanCard from '../components/PlanCard';
import usePlans from '../hooks/usePlans';

const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-16 text-gray-400">
    {children}
  </div>
);

const Subscription: React.FC = () => {
  const plans = usePlans();

  if (plans === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 pt-16">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  const safePlans = Array.isArray(plans) ? plans : [];

  return safePlans.length ? (
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {safePlans.map((p) => (
          <PlanCard key={p.code} plan={p} />
        ))}
      </div>
    </div>
  ) : (
    <EmptyState>Тарифы скоро появятся</EmptyState>
  );
};

export default Subscription;

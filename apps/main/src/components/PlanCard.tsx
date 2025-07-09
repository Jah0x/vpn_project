import React from 'react';
import Card from './ui/Card';
import OnramperPayButton from './OnramperPayButton';
import type { Plan } from '../types/plan';

interface PlanCardProps {
  plan: Plan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => (
  <Card data-testid="plan-card" className="bg-gray-800 border border-gray-700 text-center space-y-4">
    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
    <p className="text-gray-400">
      {plan.priceRub} ₽ / {plan.durationMo} мес.
    </p>
    <OnramperPayButton planCode={plan.code} />
  </Card>
);

export default PlanCard;

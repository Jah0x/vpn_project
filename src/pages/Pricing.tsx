import React from 'react';
import OnramperPayButton from '../components/OnramperPayButton';

const plans = [
  { code: 'BASIC_1M', name: '1 месяц' },
  { code: 'BASIC_3M', name: '3 месяца' },
  { code: 'BASIC_6M', name: '6 месяцев' },
  { code: 'BASIC_12M', name: '12 месяцев' },
];

const Pricing: React.FC = () => (
  <div className="min-h-screen bg-gray-900 pt-16">
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {plans.map((p) => (
        <div key={p.code} className="bg-gray-800 border border-gray-700 p-4 rounded-xl text-center space-y-4">
          <h3 className="text-xl font-bold text-white">{p.name}</h3>
          <OnramperPayButton planCode={p.code} />
        </div>
      ))}
    </div>
  </div>
);

export default Pricing;

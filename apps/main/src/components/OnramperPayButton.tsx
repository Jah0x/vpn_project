import React from 'react';
import Button from './ui/Button';

export interface OnramperPayButtonProps {
  planCode: string;
}

const amounts: Record<string, number> = {
  BASIC_1M: 400,
  BASIC_3M: 1200,
  BASIC_6M: 2400,
  BASIC_12M: 4500,
};

const OnramperPayButton: React.FC<OnramperPayButtonProps> = ({ planCode }) => {
  const rub = amounts[planCode] || 0;
  const url = `https://buy.onramper.com/?apiKey=${
    import.meta.env.VITE_ONRAMPER_KEY
  }&skipTransactionScreen=true&txnAmount=${rub}&txnFiat=RUB&txnCrypto=usdt&redirectURL=${location.origin}/payment/success?plan=${planCode}`;
  return (
    <Button className="w-full" onClick={() => window.open(url, '_blank', 'noopener')}>
      Купить за {rub} ₽
    </Button>
  );
};

export default OnramperPayButton;

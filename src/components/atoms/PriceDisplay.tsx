import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface PriceDisplayProps {
  amount: number;
  currency: string;
  locale?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ amount, currency, locale }) => {
  const formattedPrice = formatCurrency(amount, currency, locale);

  return (
    <span className="text-lg font-semibold text-gray-800">
      {formattedPrice}
    </span>
  );
};

export default PriceDisplay;

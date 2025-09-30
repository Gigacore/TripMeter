import React from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/currency';

/**
 * A component to display a formatted currency value.
 */
const PriceDisplay = ({ amount, currency, locale }) => {
  const formattedPrice = formatCurrency(amount, currency, locale);

  return (
    <span className="text-lg font-semibold text-gray-800">
      {formattedPrice}
    </span>
  );
};

PriceDisplay.propTypes = {
  amount: PropTypes.number.isRequired,
  currency: PropTypes.string.isRequired,
  locale: PropTypes.string,
};

export default PriceDisplay;
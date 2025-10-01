import React from 'react';
import { getAllCurrencies } from '../../utils/currency';

const CurrencyList: React.FC = () => {
  const currencies = getAllCurrencies();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Currencies</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currencies.map(({ code, symbol, name }) => (
          <div key={code} className="p-4 border rounded-lg shadow-md">
            <div className="text-xl font-semibold">{name}</div>
            <div className="text-lg text-gray-600">{code}</div>
            <div className="text-2xl font-bold">{symbol}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrencyList;

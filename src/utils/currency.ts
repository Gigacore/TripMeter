import currency from 'currency.js';

export const formatCurrency = (
  amount: number | null | undefined,
  currencyCode: string,
  locale: string = 'en-US'
): string => {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }

  return currency(amount, { symbol: getCurrencySymbol(currencyCode, locale) }).format();
};

export const getCurrencySymbol = (currencyCode: string, locale: string = 'en-US'): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    INR: '₹',
  };

  return symbols[currencyCode] || currencyCode;
};

export const add = (a: number, b: number): number => {
  return currency(a).add(b).value;
};

export const subtract = (a: number, b: number): number => {
  return currency(a).subtract(b).value;
};

export const multiply = (a: number, b: number): number => {
  return currency(a).multiply(b).value;
};

export const divide = (a: number, b: number): number => {
  return currency(a).divide(b).value;
};

import currency from 'currency.js';
import { getCurrencyCode as getCode, generateCurrencyMap } from '../components/organisms/charts/currency';

export const formatCurrency = (
  amount: number | null | undefined,
  currencyIdentifier: string,
  locale: string = 'en-US'
): string => {
  if (amount === null || amount === undefined) {
    return 'N/A';
  }

  const currencyCode = getCode(currencyIdentifier);

  try {
    // Use Intl.NumberFormat for robust currency formatting
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).format(amount);
  } catch (error) {
    console.error(`Error formatting currency for locale "${locale}" and currency "${currencyCode}":`, error);
    // Fallback for invalid currency codes or other errors, using currency.js
    return currency(amount, { symbol: getCurrencySymbol(currencyCode, locale) }).format();
  }
};

export const getCurrencySymbol = (currencyCode: string, locale: string = 'en-US'): string => {
  try {
    // Use a dummy value `0` to format and extract the symbol.
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).formatToParts(0);
    return parts.find(part => part.type === 'currency')?.value || currencyCode;
  } catch (e) {
    return currencyCode; // Fallback to code if Intl fails
  }
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

export const getAllCurrencies = (): { code: string; symbol: string; name: string }[] => {
  const currencyMap = generateCurrencyMap();
  return Object.entries(currencyMap).map(([name, code]) => ({
    code,
    symbol: getCurrencySymbol(code),
    name,
  }));
};

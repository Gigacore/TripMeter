import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatCurrency,
  getCurrencySymbol,
  add,
  subtract,
  multiply,
  divide,
  getAllCurrencies,
} from './currency';
import * as chartsCurrency from '../components/organisms/charts/currency';

vi.mock('../components/organisms/charts/currency', () => ({
  generateCurrencyMap: vi.fn(() => ({ 'US Dollar': 'USD' })),
  getCurrencyCode: vi.fn((c) => c),
}));

describe('currency utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('formatCurrency', () => {
    it('should format a valid amount and currency', () => {
      expect(formatCurrency(123.45, 'USD')).toBe('$123.45');
    });

    it('should return "N/A" for null or undefined amounts', () => {
      expect(formatCurrency(null, 'USD')).toBe('N/A');
      expect(formatCurrency(undefined, 'USD')).toBe('N/A');
    });

    it('should handle different locales', () => {
      expect(formatCurrency(123.45, 'EUR', 'de-DE')).toBe('123,45 €');
    });

    it('should fall back to currency.js on Intl.NumberFormat error', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Test error');
      });
      // The fallback calls getCurrencySymbol, which will also fail and return the code.
      // currency.js will then use the code as the symbol.
      expect(formatCurrency(123.45, 'USD')).toBe('USD123.45');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return the correct symbol for a currency code', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('should fall back to currency code on Intl.NumberFormat error', () => {
      vi.spyOn(Intl, 'NumberFormat').mockImplementation(() => {
        throw new Error('Test error');
      });
      expect(getCurrencySymbol('XYZ')).toBe('XYZ');
    });
  });

  describe('arithmetic functions', () => {
    it('should correctly add two numbers', () => {
      expect(add(10.5, 5.25)).toBe(15.75);
    });

    it('should correctly subtract two numbers', () => {
      expect(subtract(10.5, 5.25)).toBe(5.25);
    });

    it('should correctly multiply two numbers', () => {
      expect(multiply(10.5, 2)).toBe(21);
    });

    it('should correctly divide two numbers', () => {
      expect(divide(10.5, 2)).toBe(5.25);
    });
  });

  describe('getAllCurrencies', () => {
    it('should return a list of currencies from the map', () => {
      vi.spyOn(chartsCurrency, 'generateCurrencyMap').mockReturnValue({
        'US Dollar': 'USD',
        'Euro': 'EUR',
      });

      const currencies = getAllCurrencies();
      expect(currencies).toEqual([
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
      ]);
    });
  });
});
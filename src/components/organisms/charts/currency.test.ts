import { describe, it, expect, afterEach } from 'vitest';
import { generateCurrencyMap, getCurrencyCode, resetCurrencyMap } from './currency';

describe('currency chart utilities', () => {
  afterEach(() => {
    // Reset the memoized map after each test to ensure test isolation
    resetCurrencyMap();
  });

  describe('generateCurrencyMap', () => {
    it('should generate a map of currency names to codes', () => {
      const map = generateCurrencyMap();
      expect(map['US Dollar']).toBe('USD');
      expect(map['Euro']).toBe('EUR');
    });

    it('should include manual overrides', () => {
      const map = generateCurrencyMap();
      expect(map['British Pound Sterling']).toBe('GBP');
    });

    it('should return a memoized map on subsequent calls', () => {
      const map1 = generateCurrencyMap();
      const map2 = generateCurrencyMap();
      expect(map1).toBe(map2);

      // Verify it's not the same map after resetting
      resetCurrencyMap();
      const map3 = generateCurrencyMap();
      expect(map1).not.toBe(map3);
    });
  });

  describe('getCurrencyCode', () => {
    it('should return the currency code for a known currency name', () => {
      expect(getCurrencyCode('US Dollar')).toBe('USD');
    });

    it('should return the input string if the currency name is not found', () => {
      expect(getCurrencyCode('Unknown Currency')).toBe('Unknown Currency');
    });

    it('should return the currency code if a code is passed in', () => {
      expect(getCurrencyCode('USD')).toBe('USD');
    });

    it('should be case-sensitive and return the input if case does not match', () => {
      expect(getCurrencyCode('us dollar')).toBe('us dollar');
    });
  });
});
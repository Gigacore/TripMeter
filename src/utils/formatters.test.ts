import { describe, it, expect } from 'vitest';
import { formatDuration, formatDurationWithSeconds, toNumber } from './formatters';

describe('formatters', () => {
  describe('formatDuration', () => {
    it('should return "N/A" for negative input', () => {
      expect(formatDuration(-1)).toBe('N/A');
    });

    it('should return "0 minutes" for zero input', () => {
      expect(formatDuration(0)).toBe('0 minutes');
    });

    it('should format durations less than an hour', () => {
      expect(formatDuration(30)).toBe('30min');
    });

    it('should format durations with hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30min');
    });

    it('should include seconds when requested', () => {
      expect(formatDuration(90.5, true)).toBe('1h 30min 30s');
    });

    it('should handle complex durations', () => {
      const MIN_PER_YEAR = 365.25 * 24 * 60;
      const MIN_PER_MONTH = 30.4375 * 24 * 60;
      const MIN_PER_DAY = 24 * 60;
      const MIN_PER_HOUR = 60;
      const testDuration = MIN_PER_YEAR + 2 * MIN_PER_MONTH + 3 * MIN_PER_DAY + 4 * MIN_PER_HOUR + 5;
      expect(formatDuration(testDuration)).toBe('1y 2mo 3d 4h 5min');
    });

    it('should handle fractional minutes without showing seconds', () => {
      expect(formatDuration(0.5)).toBe('0min');
    });
  });

  describe('formatDurationWithSeconds', () => {
    it('should return "N/A" for negative input', () => {
      expect(formatDurationWithSeconds(-1)).toBe('N/A');
    });

    it('should return "0 seconds" for zero input', () => {
      expect(formatDurationWithSeconds(0)).toBe('0 seconds');
    });

    it('should format durations less than a minute in seconds', () => {
      expect(formatDurationWithSeconds(0.5)).toBe('30s');
    });

    it('should format durations greater than a minute with seconds', () => {
      expect(formatDurationWithSeconds(1.5)).toBe('1min 30s');
    });
  });

  describe('toNumber', () => {
    it('should convert a valid string to a number', () => {
      expect(toNumber('123.45')).toBe(123.45);
    });

    it('should return a number if a number is passed', () => {
      expect(toNumber(123)).toBe(123);
    });

    it('should return null for an invalid string', () => {
      expect(toNumber('abc')).toBeNull();
    });

    it('should return null for null or undefined', () => {
      expect(toNumber(null)).toBeNull();
      expect(toNumber(undefined)).toBeNull();
    });

    it('should handle boolean values', () => {
      expect(toNumber(true)).toBe(1);
      expect(toNumber(false)).toBe(0);
    });

    it('should return null for Infinity', () => {
      expect(toNumber(Infinity)).toBeNull();
      expect(toNumber(-Infinity)).toBeNull();
    });

    it('should handle array values', () => {
      expect(toNumber([])).toBe(0);
      expect(toNumber([123])).toBe(123);
      expect(toNumber(['abc'])).toBeNull();
    });
  });
});
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTripData } from './useTripData';
import { CSVRow } from '../services/csvParser';
import { DistanceUnit } from '../App';

const mockRows: CSVRow[] = [
  { status: 'completed', distance: '10', fare_amount: '20', fare_currency: 'USD', request_time: '2023-01-01T10:00:00Z', begin_trip_time: '2023-01-01T10:05:00Z', dropoff_time: '2023-01-01T10:25:00Z' },
  { status: 'completed', distance: '5', fare_amount: '10', fare_currency: 'USD', request_time: '2023-01-02T12:00:00Z', begin_trip_time: '2023-01-02T12:05:00Z', dropoff_time: '2023-01-02T12:15:00Z' },
  { status: 'rider_canceled', request_time: '2023-01-03T14:00:00Z' },
];

describe('useTripData', () => {
  it('should return initial state when no rows are provided', () => {
    const { result } = renderHook(() => useTripData([], 'miles'));
    const [stats, isAnalyzing] = result.current;

    expect(stats.totalTrips).toBe(0);
    expect(isAnalyzing).toBe(false);
  });

  it('should correctly calculate basic trip statistics', async () => {
    const { result } = renderHook(() => useTripData(mockRows, 'miles'));

    await waitFor(() => {
      const [stats] = result.current;
      expect(stats.totalTrips).toBe(3);
      expect(stats.successfulTrips).toBe(2);
      expect(stats.riderCanceledTrips).toBe(1);
      expect(stats.totalCompletedDistance).toBe(15);
    });
  });

  it('should correctly calculate fare statistics', async () => {
    const { result } = renderHook(() => useTripData(mockRows, 'miles'));

    await waitFor(() => {
      const [stats] = result.current;
      expect(stats.totalFareByCurrency['USD']).toBe(30);
      expect(stats.avgFareByCurrency['USD']).toBe(15);
      expect(stats.lowestFareByCurrency['USD'].amount).toBe(10);
      expect(stats.highestFareByCurrency['USD'].amount).toBe(20);
    });
  });

  it('should correctly calculate duration and waiting time', async () => {
    const { result } = renderHook(() => useTripData(mockRows, 'miles'));

    await waitFor(() => {
      const [stats] = result.current;
      // Trip 1: 20 min ride, 5 min wait
      // Trip 2: 10 min ride, 5 min wait
      expect(stats.totalTripDuration).toBe(30);
      expect(stats.avgTripDuration).toBe(15);
      expect(stats.totalWaitingTime).toBe(10);
      expect(stats.avgWaitingTime).toBe(5);
    });
  });

  it('should correctly set the isAnalyzing flag', async () => {
    const { result, rerender } = renderHook(
      ({ rows, unit }) => useTripData(rows, unit),
      { initialProps: { rows: [], unit: 'miles' as DistanceUnit } }
    );

    rerender({ rows: mockRows, unit: 'miles' });

    const [, isAnalyzing] = result.current;
    // It should be true immediately after the rows are provided
    expect(isAnalyzing).toBe(true);

    await waitFor(() => {
      const [, isAnalyzing] = result.current;
      expect(isAnalyzing).toBe(false);
    });
  });
});
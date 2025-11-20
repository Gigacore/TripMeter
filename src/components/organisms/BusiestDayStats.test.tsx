import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import BusiestDayStats from './BusiestDayStats';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

const mockTrips: CSVRow[] = [
  {
    distance: '10.5',
    fare_amount: '25.5',
    fare_currency: 'USD',
    begin_trip_time: '2023-01-01T10:00:00Z',
    dropoff_time: '2023-01-01T10:30:00Z',
    request_time: '2023-01-01T09:55:00Z',
  },
];

describe('BusiestDayStats', () => {
  it('should be accessible', async () => {
    await assertAccessible(<BusiestDayStats trips={mockTrips} />);
  });
});

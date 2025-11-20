import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import ConsecutiveTrips from './ConsecutiveTrips';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

vi.mock('./Map', () => ({
  default: () => <div data-testid="mock-map"></div>,
}));

const mockTripChain: CSVRow[] = [
  {
    trip_uuid: '1',
    request_time: '2023-01-01T10:00:00Z',
    begintrip_address: 'Address 1',
    dropoff_address: 'Address 2',
  },
  {
    trip_uuid: '2',
    request_time: '2023-01-01T11:00:00Z',
    begintrip_address: 'Address 2',
    dropoff_address: 'Address 3',
  },
];

describe('ConsecutiveTrips', () => {
  it('should be accessible when there is a trip chain', async () => {
    await assertAccessible(
      <ConsecutiveTrips tripChain={mockTripChain} onFocusOnTrip={() => {}} />
    );
  });

  it('should be accessible when there is no trip chain', async () => {
    await assertAccessible(
      <ConsecutiveTrips tripChain={[]} onFocusOnTrip={() => {}} />
    );
  });
});

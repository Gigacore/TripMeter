import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import RequestsMapModal from './RequestsMapModal';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';

vi.mock('./Map', () => ({
  default: () => <div data-testid="mock-map"></div>,
}));

vi.mock('./TripList', () => ({
  default: () => <div data-testid="mock-trip-list"></div>,
}));

const mockRows: CSVRow[] = [
  {
    trip_uuid: '1',
    request_time: '2023-01-01T10:00:00Z',
    begintrip_address: 'Address 1',
    dropoff_address: 'Address 2',
  },
];

describe('RequestsMapModal', () => {
  it('should be accessible', async () => {
    await assertAccessible(
      <RequestsMapModal
        rows={mockRows}
        distanceUnit={'miles' as DistanceUnit}
        convertDistance={(m) => m}
      >
        <button>Open Modal</button>
      </RequestsMapModal>
    );
  });
});

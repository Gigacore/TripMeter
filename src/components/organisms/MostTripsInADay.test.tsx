import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import MostTripsInADay from './MostTripsInADay';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

vi.mock('./Map', () => ({
  default: () => <div data-testid="mock-map"></div>,
}));

vi.mock('./BusiestDayStats', () => ({
  default: () => <div data-testid="mock-busiest-day-stats"></div>,
}));

const mockMostTripsInADay = {
  count: 5,
  date: new Date('2023-01-01').getTime(),
  trips: [
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
  ] as CSVRow[],
};

describe('MostTripsInADay', () => {
  it('should be accessible', async () => {
    await assertAccessible(<MostTripsInADay mostTripsInADay={mockMostTripsInADay} />);
  });

  it('should not render if there are less than 2 trips', async () => {
    const { container } = render(
      <MostTripsInADay mostTripsInADay={{ ...mockMostTripsInADay, count: 1 }} />
    );
    expect(container.firstChild).toBeNull();
  });
});

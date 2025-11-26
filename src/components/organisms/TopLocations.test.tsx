import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import TopLocations from './TopLocations';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

vi.mock('./Map', () => ({
  default: () => <div data-testid="mock-map"></div>,
}));

const mockRows: CSVRow[] = [
  {
    status: 'completed',
    city: 'San Francisco',
    begintrip_lat: '37.7749',
    begintrip_lng: '-122.4194',
    dropoff_lat: '37.7749',
    dropoff_lng: '-122.4194',
    begintrip_address: 'Address 1',
    dropoff_address: 'Address 2',
  },
];

describe('TopLocations', () => {
  it('should be accessible', async () => {
    await assertAccessible(<TopLocations rows={mockRows} />);
  });

  it('should render a message when there are no completed trips', () => {
    const { getByText } = render(<TopLocations rows={[]} />);
    expect(getByText('No completed trips to analyze for top locations.')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TripList from './TripList';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

const mockTrips: CSVRow[] = [
  { id: '1', status: 'completed', begintrip_address: 'A', dropoff_address: 'B' },
  { id: '2', status: 'rider_canceled', begintrip_address: 'C', dropoff_address: 'D' },
];

const mockProps = {
  list: mockTrips,
  title: 'Test Trip List',
  onBack: vi.fn(),
  onFocusOnTrip: vi.fn(),
};

describe('TripList', () => {
  it('should be accessible', async () => {
    await assertAccessible(<TripList {...mockProps} />);
  });

  it('should render the title and the list of trips', () => {
    render(<TripList {...mockProps} />);

    expect(screen.getByText('Test Trip List')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('should call onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    render(<TripList {...mockProps} />);

    await user.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(mockProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('should call onFocusOnTrip with the correct trip when an item is clicked', async () => {
    const user = userEvent.setup();
    render(<TripList {...mockProps} />);

    const tripItem = screen.getByText('A');
    await user.click(tripItem);

    expect(mockProps.onFocusOnTrip).toHaveBeenCalledWith(mockTrips[0]);
  });

  it('should render an empty list when no trips are provided', () => {
    render(<TripList {...mockProps} list={[]} />);
    expect(screen.queryByText('Trip #1')).not.toBeInTheDocument();
  });
});
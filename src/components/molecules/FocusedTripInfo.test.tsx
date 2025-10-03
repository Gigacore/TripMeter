import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FocusedTripInfo from './FocusedTripInfo';

const mockTrip = {
  status: 'Completed',
  begintrip_address: '123 Main St',
  dropoff_address: '456 Oak Ave',
  distance: '5.2 miles',
};

describe('FocusedTripInfo', () => {
  it('should render the trip information', () => {
    render(<FocusedTripInfo trip={mockTrip} onShowAll={() => {}} />);

    expect(screen.getByText('Focused Trip')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    expect(screen.getByText(/456 Oak Ave/)).toBeInTheDocument();
    expect(screen.getByText(/5.2 miles/)).toBeInTheDocument();
  });

  it('should call the onShowAll handler when the "Show All" button is clicked', () => {
    const handleShowAll = vi.fn();
    render(<FocusedTripInfo trip={mockTrip} onShowAll={handleShowAll} />);

    fireEvent.click(screen.getByText('Show All'));
    expect(handleShowAll).toHaveBeenCalledTimes(1);
  });

  it('should display "N/A" for missing trip data', () => {
    const partialTrip = {
      status: 'Completed',
      distance: '5.2 miles',
    };
    render(<FocusedTripInfo trip={partialTrip} onShowAll={() => {}} />);

    const infoContainer = screen.getByText('Status:').parentElement;
    expect(infoContainer).toHaveTextContent('From: N/A');
    expect(infoContainer).toHaveTextContent('To: N/A');
  });
});
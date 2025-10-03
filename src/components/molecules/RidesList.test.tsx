import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RidesList from './RidesList';

describe('RidesList', () => {
  it('should render a list of rides', () => {
    render(<RidesList />);

    expect(screen.getByText('Morning Ride')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Commute')).toBeInTheDocument();
    expect(screen.getByText('Weekend Trip')).toBeInTheDocument();
  });

  it('should render the "Rides" heading', () => {
    render(<RidesList />);

    expect(screen.getByRole('heading', { name: 'Rides' })).toBeInTheDocument();
  });
});
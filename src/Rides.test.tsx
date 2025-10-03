import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Rides from './Rides';

// Mock child components
vi.mock('@/components/organisms/Map', () => ({
  default: () => <div data-testid="map" />,
}));

describe('Rides', () => {
  it('should render the Rides page with its content', () => {
    render(<Rides />);

    // Check for Map component (mocked)
    expect(screen.getByTestId('map')).toBeInTheDocument();

    // Check for RidesList content
    expect(screen.getByRole('heading', { name: 'Rides' })).toBeInTheDocument();
    expect(screen.getByText('Morning Ride')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Commute')).toBeInTheDocument();
    expect(screen.getByText('Weekend Trip')).toBeInTheDocument();
  });
});
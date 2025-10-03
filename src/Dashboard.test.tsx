import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';

// Mock child components
vi.mock('@/components/organisms/Map', () => ({
  default: () => <div data-testid="map" />,
}));

describe('Dashboard', () => {
  it('should render the dashboard with its content', () => {
    render(<Dashboard />);

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();

    // Check for Map component (mocked)
    expect(screen.getByTestId('map')).toBeInTheDocument();

    // Check for SimpleStats content
    expect(screen.getByText('Total Rides: 123')).toBeInTheDocument();
    expect(screen.getByText('Total Distance: 4567 km')).toBeInTheDocument();
    expect(screen.getByText('Longest Ride: 89 km')).toBeInTheDocument();
  });
});
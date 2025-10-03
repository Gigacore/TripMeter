import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TopStats from './TopStats';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';

// Mock dependencies
vi.mock('../../utils/formatters', () => ({
  formatDuration: (minutes: number) => `${minutes} min`,
}));

vi.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount.toFixed(2)} ${currency}`,
}));

vi.mock('lucide-react', () => ({
  CheckCircle: () => <div />,
  Wallet: () => <div />,
  Route: () => <div />,
  Clock: () => <div />,
}));

const mockTripData: TripStats = {
  successfulTrips: 123,
  totalFareByCurrency: { USD: 1234.56, EUR: 987.65 },
  totalCompletedDistance: 5432.1,
  totalTripDuration: 600,
  avgSpeed: 0,
  fastestTripBySpeed: 0,
  fastestTripBySpeedRow: null,
  slowestTripBySpeed: 0,
  slowestTripBySpeedRow: null,
  speedDistribution: [],
  totalDistance: 0,
  totalTrips: 0,
  averageDistance: 0,
  averageFare: 0,
  avgTripDuration: 0,
  longestTrip: 0,
  longestTripRow: null,
  shortestTrip: 0,
  shortestTripRow: null,
  topPickups: [],
  topDropoffs: [],
  tripsByHour: [],
  tripsByDay: [],
  fareByDistance: [],
  convertDistance: (m:number) => m,
  longestStreak: { days: 0, startDate: null, endDate: null },
  longestGap: { days: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeCancellation: { count: 0, startDate: null, endDate: null },
  longestCancellationStreak: { count: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 0, startDate: null, endDate: null },
  longestDriverCancellationStreak: { count: 0, startDate: null, endDate: null },
  avgCompletedDistance: 0,
  costPerDistanceByCurrency: {},
  lowestFareByCurrency: {},
  highestFareByCurrency: {},
  tripsByYear: [],
};

const mockProps = {
  tripData: mockTripData,
  distanceUnit: 'miles' as DistanceUnit,
};

describe('TopStats', () => {
  it('should render the top stats correctly', () => {
    render(<TopStats {...mockProps} />);

    expect(screen.getByText('Completed Rides')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();

    expect(screen.getByText('Total Distance')).toBeInTheDocument();
    expect(screen.getByText(/5432.10/)).toBeInTheDocument();

    expect(screen.getByText('Total Ride Time')).toBeInTheDocument();
    expect(screen.getByText('600 min')).toBeInTheDocument();
  });

  it('should render the currency switcher when multiple currencies are present', () => {
    render(<TopStats {...mockProps} />);
    expect(screen.getByLabelText('Go to currency 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to currency 2')).toBeInTheDocument();
    expect(screen.getByText('1234.56 USD')).toBeInTheDocument();
  });

  it('should switch currency when the switcher is clicked', async () => {
    const user = userEvent.setup();
    render(<TopStats {...mockProps} />);

    expect(screen.getByText('1234.56 USD')).toBeInTheDocument();

    const currency2Button = screen.getByLabelText('Go to currency 2');
    await user.click(currency2Button);

    expect(await screen.findByText('987.65 EUR')).toBeInTheDocument();
  });

  it('should not render the currency switcher for a single currency', () => {
    const singleCurrencyData = { ...mockTripData, totalFareByCurrency: { USD: 1234.56 } };
    render(<TopStats {...mockProps} tripData={singleCurrencyData} />);

    expect(screen.queryByLabelText('Go to currency 1')).not.toBeInTheDocument();
    expect(screen.getByText('1234.56 USD')).toBeInTheDocument();
  });
});
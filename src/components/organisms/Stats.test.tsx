import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Stats from './Stats';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';

// Mock all child components
vi.mock('./charts/FareCharts', () => ({ default: (props: any) => <div data-testid="fare-charts" {...props} /> }));
vi.mock('./charts/DurationCharts', () => ({ default: (props: any) => <div data-testid="duration-charts" {...props} /> }));
vi.mock('./charts/DistanceCharts', () => ({ default: (props: any) => <div data-testid="distance-charts" {...props} /> }));
vi.mock('./charts/SpeedCharts', () => ({ default: (props: any) => <div data-testid="speed-charts" {...props} /> }));
vi.mock('./charts/WaitingTimeCharts', () => ({ default: (props: any) => <div data-testid="waiting-time-charts" {...props} /> }));
vi.mock('./charts/ActivityCharts', () => ({ default: (props: any) => <div data-testid="activity-charts" {...props} /> }));
vi.mock('./TopCities', () => ({ default: (props: any) => <div data-testid="top-cities" {...props} /> }));
vi.mock('./charts/TripSummaryChart', () => ({ default: (props: any) => <div data-testid="trip-summary-chart" {...props} /> }));
vi.mock('./charts/TripsByYearChart', () => ({ default: (props: any) => <div data-testid="trips-by-year-chart" {...props} /> }));
vi.mock('./charts/ProductTypesChart', () => ({ default: (props: any) => <div data-testid="product-types-chart" {...props} /> }));
vi.mock('./TopStats', () => ({ default: (props: any) => <div data-testid="top-stats" {...props} /> }));
vi.mock('./FareDistanceScatterPlot', () => ({ default: (props: any) => <div data-testid="fare-distance-scatter-plot" {...props} /> }));
vi.mock('./CostEfficiencyChart', () => ({ default: (props: any) => <div data-testid="cost-efficiency-chart" {...props} /> }));
vi.mock('./CancellationBreakdownChart', () => ({ default: (props: any) => <div data-testid="cancellation-breakdown-chart" {...props} /> }));
vi.mock('./charts/StreaksAndPauses', () => ({ default: (props: any) => <div data-testid="streaks-and-pauses" {...props} /> }));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const mockTripData: TripStats = {
  totalDistance: 100,
  totalFare: 500,
  totalTrips: 10,
  averageDistance: 10,
  averageFare: 50,
  averageSpeed: 60,
  topPickups: [],
  topDropoffs: [],
  tripsByHour: [],
  tripsByDay: [],
  fareByDistance: [],
  totalFareByCurrency: { USD: 500, EUR: 200 },
  convertDistance: (miles: number) => miles,
  longestStreak: 5,
  longestGap: 3,
  longestSuccessfulStreakBeforeCancellation: 10,
  longestCancellationStreak: 2,
  longestSuccessfulStreakBeforeDriverCancellation: 8,
  longestDriverCancellationStreak: 1,
};

const mockProps = {
  data: mockTripData,
  onFocusOnTrip: vi.fn(),
  onShowTripList: vi.fn(),
  distanceUnit: 'miles' as DistanceUnit,
  rows: [{ id: 1 }],
};

describe('Stats', () => {
  it('should render all child components', () => {
    render(<Stats {...mockProps} />);
    expect(screen.getByTestId('top-stats')).toBeInTheDocument();
    expect(screen.getByTestId('fare-charts')).toBeInTheDocument();
    expect(screen.getByTestId('duration-charts')).toBeInTheDocument();
  });

  it('should pass the correct props to TopStats', () => {
    render(<Stats {...mockProps} />);
    const topStats = screen.getByTestId('top-stats');
    expect(topStats).toHaveAttribute('distanceUnit', 'miles');
  });

  it('should initialize activeCurrency to the first currency in the list', () => {
    render(<Stats {...mockProps} />);
    const fareCharts = screen.getByTestId('fare-charts');
    expect(fareCharts).toHaveAttribute('activeCurrency', 'USD');
  });
});
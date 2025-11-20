import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Stats from './Stats';
import { CSVRow } from '../../services/csvParser';
import { TripStats } from '../../hooks/useTripData';
import { DistanceUnit } from '../../App';

// Mock all child components
vi.mock('./charts/FareCharts', () => ({
  default: ({ activeCurrency, setActiveCurrency }: { activeCurrency: string | null, setActiveCurrency: (c: string) => void }) => (
    <div data-testid="fare-charts" data-active-currency={activeCurrency} onClick={() => setActiveCurrency('USD')} />
  )
}));
vi.mock('./charts/DurationCharts', () => ({ default: () => <div data-testid="duration-charts" /> }));
vi.mock('./charts/DistanceCharts', () => ({ default: () => <div data-testid="distance-charts" /> }));
vi.mock('./charts/SpeedCharts', () => ({ default: () => <div data-testid="speed-charts" /> }));
vi.mock('./charts/WaitingTimeCharts', () => ({ default: () => <div data-testid="waiting-time-charts" /> }));
vi.mock('./charts/ActivityCharts', () => ({ default: () => <div data-testid="activity-charts" /> }));
vi.mock('./TopCities', () => ({ default: () => <div data-testid="top-cities" /> }));
vi.mock('./charts/TripSummaryChart', () => ({ default: () => <div data-testid="trip-summary-chart" /> }));
vi.mock('./charts/TripsByYearChart', () => ({ default: () => <div data-testid="trips-by-year-chart" /> }));
vi.mock('./charts/ProductTypesChart', () => ({ default: () => <div data-testid="product-types-chart" /> }));
vi.mock('./TopStats', () => ({ default: ({ distanceUnit }: { distanceUnit: DistanceUnit }) => <div data-testid="top-stats" data-distance-unit={distanceUnit} /> }));
vi.mock('./FareDistanceScatterPlot', () => ({ default: () => <div data-testid="fare-distance-scatter-plot" /> }));
vi.mock('./CostEfficiencyChart', () => ({ default: () => <div data-testid="cost-efficiency-chart" /> }));
vi.mock('./CancellationBreakdownChart', () => ({ default: () => <div data-testid="cancellation-breakdown-chart" /> }));
vi.mock('./charts/StreaksAndPauses', () => ({ default: () => <div data-testid="streaks-and-pauses" /> }));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const mockTripData: TripStats = {
  beginCount: 10,
  dropoffCount: 10,
  avgSpeed: 60,
  longestTrip: 100,
  longestTripByDist: 100,
  shortestTrip: 10,
  shortestTripByDist: 10,
  longestTripRow: null,
  totalWaitingTime: 100,
  avgWaitingTime: 10,
  shortestWaitingTime: 1,
  longestWaitingTime: 20,
  shortestWaitingTimeRow: null,
  longestWaitingTimeRow: null,
  waitingLongerThanTripCount: 0,
  totalWaitingTimeForLongerWaits: 0,
  totalRidingTimeForLongerWaits: 0,
  fastestTripBySpeed: 100,
  fastestTripBySpeedRow: null,
  speedDistribution: [],
  slowestTripBySpeed: 10,
  slowestTripBySpeedRow: null,
  longestTripByDistRow: null,
  shortestTripRow: null,
  shortestTripByDistRow: null,
  avgTripDuration: 20,
  totalTripDuration: 200,
  totalCompletedDistance: 100,
  avgCompletedDistance: 10,
  totalTrips: 10,
  successfulTrips: 8,
  riderCanceledTrips: 1,
  driverCanceledTrips: 1,
  canceledTrips: 2,
  unfulfilledTrips: 0,
  avgFareByCurrency: { USD: 50 },
  lowestFareByCurrency: { USD: { amount: 10, row: {} as CSVRow } },
  highestFareByCurrency: { USD: { amount: 100, row: {} as CSVRow } },
  totalFareByCurrency: { USD: 500, EUR: 200 },
  costPerDistanceByCurrency: { USD: 5 },
  costPerDurationByCurrency: { USD: 2.5 },
  avgCostPerDistanceByYear: {},
  totalFareByYear: {},
  longestStreak: { days: 5, startDate: null, endDate: null },
  longestGap: { days: 3, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeCancellation: { count: 10, startDate: null, endDate: null },
  longestCancellationStreak: { count: 2, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 8, startDate: null, endDate: null },
  longestDriverCancellationStreak: { count: 1, startDate: null, endDate: null },
  tripsByYear: [],
  avgSpeedByDayOfWeek: [],
  mostSuccessfulTripsInADay: { count: 0, date: null, trips: [] },
  longestConsecutiveTripsChain: [],
  convertDistance: (miles: number) => miles,
};

const mockProps = {
  data: mockTripData,
  onFocusOnTrip: vi.fn(),
  onFocusOnTrips: vi.fn(),
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
    expect(topStats).toHaveAttribute('data-distance-unit', 'miles');
  });

  it('should initialize activeCurrency to the first currency in the list', () => {
    render(<Stats {...mockProps} />);
    const fareCharts = screen.getByTestId('fare-charts');
    expect(fareCharts).toHaveAttribute('data-active-currency', 'USD');
  });
});
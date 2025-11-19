import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WaitingTimeCharts from './WaitingTimeCharts';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '../../../services/csvParser';
import { DistanceUnit } from '../../../App';

// Mock child components and dependencies
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LabelList: () => <div />,
  Legend: () => <div />,
}));

vi.mock('../../atoms/Stat', () => ({
  default: ({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) => (
    <div data-testid="stat" onClick={onClick}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('../RequestsMapModal', () => ({
  default: ({ children, title, rows }: any) => (
    <div data-testid="requests-map-modal" data-title={title} data-rows={rows?.length}>
      {children}
    </div>
  ),
}));

vi.mock('../../../utils/formatters', () => ({
  formatDuration: (minutes: number) => `${minutes} min`,
  formatDurationWithSeconds: (minutes: number) => `${minutes} min`,
}));

const mockLongestWaitRow: CSVRow = { 'Request id': 'longest_wait' };
const mockShortestWaitRow: CSVRow = { 'Request id': 'shortest_wait' };

const mockTripData: TripStats = {
  totalWaitingTime: 60,
  avgWaitingTime: 10,
  longestWaitingTime: 25,
  longestWaitingTimeRow: mockLongestWaitRow,
  shortestWaitingTime: 2,
  shortestWaitingTimeRow: mockShortestWaitRow,
  totalTripDuration: 120,
  waitingLongerThanTripCount: 1,
  totalWaitingTimeForLongerWaits: 25,
  totalRidingTimeForLongerWaits: 20,
  totalCompletedDistance: 0,
  avgCompletedDistance: 0,
  longestTripByDist: 0,
  longestTripByDistRow: null,
  shortestTripByDist: 0,
  shortestTripByDistRow: null,
  costPerDistanceByCurrency: {},
  totalFareByCurrency: {},
  avgFareByCurrency: {},
  lowestFareByCurrency: {},
  highestFareByCurrency: {},
  tripsByYear: [],
  totalTrips: 0,
  avgSpeed: 0,
  fastestTripBySpeed: 0,
  fastestTripBySpeedRow: null,
  slowestTripBySpeed: 0,
  slowestTripBySpeedRow: null,
  speedDistribution: [],
  convertDistance: (m: number) => m,
  longestStreak: { days: 0, startDate: null, endDate: null },
  longestGap: { days: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeCancellation: { count: 0, startDate: null, endDate: null },
  longestCancellationStreak: { count: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 0, startDate: null, endDate: null },
  longestDriverCancellationStreak: { count: 0, startDate: null, endDate: null },
  beginCount: 0,
  dropoffCount: 0,
  longestTrip: 0,
  shortestTrip: 0,
  longestTripRow: null,
  shortestTripRow: null,
  shortestWaitingTimeRow: null,
  longestWaitingTimeRow: null,
  shortestTripByDistRow: null,
  longestTripByDistRow: null,
  avgTripDuration: 0,
  successfulTrips: 0,
  riderCanceledTrips: 0,
  driverCanceledTrips: 0,
  canceledTrips: 0,
  unfulfilledTrips: 0,
  costPerDurationByCurrency: {},
  avgCostPerDistanceByYear: {},
  totalFareByYear: {},
  avgSpeedByDayOfWeek: [],
  mostSuccessfulTripsInADay: { count: 0, date: null, trips: [] },
  longestConsecutiveTripsChain: [],
};

const mockProps = {
  data: mockTripData,
  rows: [
    { status: 'completed', request_time: '2023-01-01T10:00:00Z', begin_trip_time: '2023-01-01T10:10:00Z' },
  ],
  onShowTripList: vi.fn(),
  onFocusOnTrips: vi.fn(),
  distanceUnit: 'miles' as DistanceUnit,
  convertDistance: (m: number) => m,
};

describe('WaitingTimeCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the distribution chart and stats', () => {
    render(<WaitingTimeCharts {...mockProps} />);
    expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);

    const stats = screen.getAllByTestId('stat');
    expect(stats.some(s => s.textContent?.includes('Total Wait'))).toBe(true);
    expect(stats.some(s => s.textContent?.includes('Average Wait'))).toBe(true);
  });

  it('should render the "Waited Longer Than Rode" section when applicable', () => {
    render(<WaitingTimeCharts {...mockProps} />);
    expect(screen.getByText('Waited Longer Than Rode')).toBeInTheDocument();
    expect(screen.getByText('1 Rides')).toBeInTheDocument();

    const modals = screen.getAllByTestId('requests-map-modal');
    const waitedLongerModal = modals.find(m => m.getAttribute('data-title') === 'Waited Longer Than Rode');
    expect(waitedLongerModal).toBeInTheDocument();
  });

  it('should not render "Waited Longer Than Rode" section when not applicable', () => {
    const noLongWaitsData = { ...mockTripData, waitingLongerThanTripCount: 0 };
    render(<WaitingTimeCharts {...mockProps} data={noLongWaitsData} />);
    expect(screen.queryByText('Waited Longer Than Rode')).not.toBeInTheDocument();
  });

  it('should use RequestsMapModal for longest waiting time', () => {
    render(<WaitingTimeCharts {...mockProps} />);
    const modals = screen.getAllByTestId('requests-map-modal');
    const longestModal = modals.find(m => m.getAttribute('data-title') === 'Longest Wait Time');
    expect(longestModal).toBeInTheDocument();
    expect(longestModal).toHaveAttribute('data-rows', '1');
  });

  it('should use RequestsMapModal for shortest waiting time', () => {
    render(<WaitingTimeCharts {...mockProps} />);
    const modals = screen.getAllByTestId('requests-map-modal');
    const shortestModal = modals.find(m => m.getAttribute('data-title') === 'Shortest Wait Time');
    expect(shortestModal).toBeInTheDocument();
    expect(shortestModal).toHaveAttribute('data-rows', '1');
  });
});
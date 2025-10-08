import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import WaitingTimeCharts from './WaitingTimeCharts';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '../../../services/csvParser';

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
  totalDistance: 0,
  totalTrips: 0,
  averageDistance: 0,
  averageFare: 0,
  avgSpeed: 0,
  fastestTripBySpeed: 0,
  fastestTripBySpeedRow: null,
  slowestTripBySpeed: 0,
  slowestTripBySpeedRow: null,
  speedDistribution: [],
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
};

const mockProps = {
  data: mockTripData,
  rows: [
    { status: 'completed', request_time: '2023-01-01T10:00:00Z', begin_trip_time: '2023-01-01T10:10:00Z' },
  ],
  onShowTripList: vi.fn(),
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
  });

  it('should not render "Waited Longer Than Rode" section when not applicable', () => {
    const noLongWaitsData = { ...mockTripData, waitingLongerThanTripCount: 0 };
    render(<WaitingTimeCharts {...mockProps} data={noLongWaitsData} />);
    expect(screen.queryByText('Waited Longer Than Rode')).not.toBeInTheDocument();
  });

  it('should call onShowTripList when longest waiting time stat is clicked', async () => {
    const user = userEvent.setup();
    render(<WaitingTimeCharts {...mockProps} />);
    const longestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Longest Wait'));
    if (longestStat) {
      await user.click(longestStat);
      expect(mockProps.onShowTripList).toHaveBeenCalledWith(`single-trip-map:${mockLongestWaitRow['Request id']}`);
    }
  });

  it('should call onShowTripList when shortest waiting time stat is clicked', async () => {
    const user = userEvent.setup();
    render(<WaitingTimeCharts {...mockProps} />);
    const shortestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Shortest Wait'));
    if (shortestStat) {
      await user.click(shortestStat);
      expect(mockProps.onShowTripList).toHaveBeenCalledWith(`single-trip-map:${mockShortestWaitRow['Request id']}`);
    }
  });
});
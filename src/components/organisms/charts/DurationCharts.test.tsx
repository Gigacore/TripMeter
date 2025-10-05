import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DurationCharts from './DurationCharts';
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
  Bar: () => <div />,
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

const mockLongestTripRow: CSVRow = { id: 'longest' };
const mockShortestTripRow: CSVRow = { id: 'shortest' };

const mockTripData: TripStats = {
  totalTripDuration: 1200,
  avgTripDuration: 30,
  longestTrip: 120,
  longestTripRow: mockLongestTripRow,
  shortestTrip: 5,
  shortestTripRow: mockShortestTripRow,
  totalCompletedDistance: 0,
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
  averageSpeed: 0,
  topPickups: [],
  topDropoffs: [],
  tripsByHour: [],
  tripsByDay: [],
  fareByDistance: [],
  convertDistance: (m:number) => m,
  longestStreak: 0,
  longestGap: 0,
  longestSuccessfulStreakBeforeCancellation: 0,
  longestCancellationStreak: 0,
  longestSuccessfulStreakBeforeDriverCancellation: 0,
  longestDriverCancellationStreak: 0,
};

const mockProps = {
  data: mockTripData,
  rows: [
    { status: 'completed', begin_trip_time: '2023-01-01T10:00:00Z', dropoff_time: '2023-01-01T10:30:00Z' },
  ],
  onFocusOnTrip: vi.fn(),
};

describe('DurationCharts', () => {
  it('should render the chart and stats', () => {
    render(<DurationCharts {...mockProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const stats = screen.getAllByTestId('stat');
    expect(stats.some(s => s.textContent?.includes('Total'))).toBe(true);
    expect(stats.some(s => s.textContent?.includes('Average'))).toBe(true);
  });

  it('should call onFocusOnTrip when longest trip stat is clicked', async () => {
    const user = userEvent.setup();
    render(<DurationCharts {...mockProps} />);
    const longestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Longest'));
    if (longestStat) {
      await user.click(longestStat);
      expect(mockProps.onFocusOnTrip).toHaveBeenCalledWith(mockLongestTripRow);
    }
  });

  it('should call onFocusOnTrip when shortest trip stat is clicked', async () => {
    const user = userEvent.setup();
    render(<DurationCharts {...mockProps} />);
    const shortestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Shortest'));
    if (shortestStat) {
      await user.click(shortestStat);
      expect(mockProps.onFocusOnTrip).toHaveBeenCalledWith(mockShortestTripRow);
    }
  });
});
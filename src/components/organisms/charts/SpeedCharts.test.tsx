import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SpeedCharts from './SpeedCharts';
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
  Bar: ({ children }: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
  Cell: () => <div />,
}));

vi.mock('../../atoms/Stat', () => ({
  default: ({ label, value, unit, onClick }: { label: string; value: string | number; unit?: string; onClick?: () => void }) => (
    <div data-testid="stat" onClick={onClick}>
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
  ),
}));

const mockFastestTripRow: CSVRow = { id: 'fastest' };
const mockSlowestTripRow: CSVRow = { id: 'slowest' };

const mockTripData: TripStats = {
  avgSpeed: 30,
  fastestTripBySpeed: 60,
  fastestTripBySpeedRow: mockFastestTripRow,
  slowestTripBySpeed: 10,
  slowestTripBySpeedRow: mockSlowestTripRow,
  speedDistribution: [{ name: '20-30', count: 5 }],
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
  totalTripDuration: 0,
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
  longestStreak: 0,
  longestGap: 0,
  longestSuccessfulStreakBeforeCancellation: 0,
  longestCancellationStreak: 0,
  longestSuccessfulStreakBeforeDriverCancellation: 0,
  longestDriverCancellationStreak: 0,
};

const mockProps = {
  data: mockTripData,
  rows: [],
  distanceUnit: 'mph' as DistanceUnit,
  activeCurrency: 'USD',
  onFocusOnTrip: vi.fn(),
};

describe('SpeedCharts', () => {
  it('should render the chart and stats', () => {
    render(<SpeedCharts {...mockProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const stats = screen.getAllByTestId('stat');
    expect(stats.some(s => s.textContent?.includes('Overall Avg. Speed'))).toBe(true);
    expect(stats.some(s => s.textContent?.includes('Fastest Trip'))).toBe(true);
  });

  it('should call onFocusOnTrip when fastest trip stat is clicked', async () => {
    const user = userEvent.setup();
    render(<SpeedCharts {...mockProps} />);
    const fastestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Fastest Trip'));
    if (fastestStat) {
      await user.click(fastestStat);
      expect(mockProps.onFocusOnTrip).toHaveBeenCalledWith(mockFastestTripRow);
    }
  });

  it('should call onFocusOnTrip when slowest trip stat is clicked', async () => {
    const user = userEvent.setup();
    render(<SpeedCharts {...mockProps} />);
    const slowestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Slowest Trip'));
    if (slowestStat) {
      await user.click(slowestStat);
      expect(mockProps.onFocusOnTrip).toHaveBeenCalledWith(mockSlowestTripRow);
    }
  });
});
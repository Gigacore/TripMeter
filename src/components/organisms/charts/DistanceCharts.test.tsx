import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DistanceCharts from './DistanceCharts';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '../../../services/csvParser';
import { DistanceUnit } from '../../../App';

// Mock child components and dependencies
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
  CartesianGrid: () => <div />,
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Bar: () => <div />,
}));

vi.mock('../../atoms/Stat', () => ({
  default: ({ label, value, unit, onClick }: { label: string; value: string | number; unit?: string; onClick?: () => void }) => (
    <div data-testid="stat" onClick={onClick}>
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
  ),
}));

vi.mock('../../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount.toFixed(2)} ${currency}`,
}));

const mockLongestTripRow: CSVRow = { 'Request id': 'longest' };
const mockShortestTripRow: CSVRow = { 'Request id': 'shortest' };

const mockTripData: TripStats = {
  totalCompletedDistance: 150.5,
  avgCompletedDistance: 25.08,
  longestTripByDist: 50.2,
  longestTripByDistRow: mockLongestTripRow,
  shortestTripByDist: 1.8,
  shortestTripByDistRow: mockShortestTripRow,
  costPerDistanceByCurrency: { USD: 3.5 },
  totalFareByCurrency: {},
  avgFareByCurrency: { USD: 25 },
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

const mockTripDataWithYearly = {
  ...mockTripData,
  tripsByYear: [
    { year: 2022, totalDistance: 100, count: 10, totalFare: { USD: 250 }, totalRidingTime: 120, totalWaitingTime: 30, farthestTrip: 20, shortestTrip: 1, highestFare: { USD: 50 }, lowestFare: { USD: 5 } },
    { year: 2023, totalDistance: 200, count: 20, totalFare: { USD: 500 }, totalRidingTime: 240, totalWaitingTime: 60, farthestTrip: 25, shortestTrip: 2, highestFare: { USD: 60 }, lowestFare: { USD: 10 } },
  ],
};


const mockProps = {
  data: mockTripData,
  rows: [{ status: 'completed', distance: '10' }],
  distanceUnit: 'miles' as DistanceUnit,
  activeCurrency: 'USD',
  onShowTripList: vi.fn(),
  convertDistance: (m: number) => m,
};

describe('DistanceCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chart and stats', () => {
    render(<DistanceCharts {...mockProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const stats = screen.getAllByTestId('stat');
    expect(stats.some(s => s.textContent?.includes('Total Distance'))).toBe(true);
    expect(stats.some(s => s.textContent?.includes('Avg. Distance'))).toBe(true);
  });

  it('should render the cost per distance when activeCurrency is provided', () => {
    render(<DistanceCharts {...mockProps} />);
    const costStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Cost per miles'));
    expect(costStat).toBeInTheDocument();
    expect(costStat).toHaveTextContent('3.50 USD/miles');
  });

  it('should not render cost per distance when activeCurrency is null', () => {
    render(<DistanceCharts {...mockProps} activeCurrency={null} />);
    const costStat = screen.queryByText(/Cost per/);
    expect(costStat).not.toBeInTheDocument();
  });

  it('should call onShowTripList when longest trip stat is clicked', async () => {
    const user = userEvent.setup();
    render(<DistanceCharts {...mockProps} />);
    const longestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Longest'));
    if (longestStat) {
      await user.click(longestStat);
      expect(mockProps.onShowTripList).toHaveBeenCalledWith(`single-trip-map:${mockLongestTripRow['Request id']}`);
    }
  });

  it('should call onShowTripList when shortest trip stat is clicked', async () => {
    const user = userEvent.setup();
    render(<DistanceCharts {...mockProps} />);
    const shortestStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Shortest'));
    if (shortestStat) {
      await user.click(shortestStat);
      expect(mockProps.onShowTripList).toHaveBeenCalledWith(`single-trip-map:${mockShortestTripRow['Request id']}`);
    }
  });

  it('should render the distance by year chart when data is available', () => {
    render(<DistanceCharts {...mockProps} data={mockTripDataWithYearly} />);
    expect(screen.getByText(`Total Distance by Year (${mockProps.distanceUnit})`)).toBeInTheDocument();
    expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(1);
  });
});
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

vi.mock('../RequestsMapModal', () => ({
  default: ({ children, title, rows }: any) => (
    <div data-testid="requests-map-modal" data-title={title} data-rows={JSON.stringify(rows)}>
      {children}
    </div>
  ),
}));

const mockFastestTripRow: CSVRow = { 'Request id': 'fastest' };
const mockSlowestTripRow: CSVRow = { 'Request id': 'slowest' };

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
  totalTrips: 0,
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
  convertDistance: (m: number) => m,
  longestStreak: { days: 0, startDate: null, endDate: null },
  longestGap: { days: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeCancellation: { count: 0, startDate: null, endDate: null },
  longestCancellationStreak: { count: 0, startDate: null, endDate: null },
  longestSuccessfulStreakBeforeDriverCancellation: { count: 0, startDate: null, endDate: null },
  longestDriverCancellationStreak: { count: 0, startDate: null, endDate: null },
  longestConsecutiveTripsChain: [],
  mostSuccessfulTripsInADay: { count: 0, date: null, trips: [] },
};

const mockProps = {
  data: mockTripData,
  rows: [],
  distanceUnit: 'miles' as DistanceUnit,
  activeCurrency: 'USD',
  onFocusOnTrips: vi.fn(),
  convertDistance: (m: number) => m,
};

describe('SpeedCharts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chart and stats', () => {
    render(<SpeedCharts {...mockProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const stats = screen.getAllByTestId('stat');
    expect(stats.some(s => s.textContent?.includes('Overall Avg. Speed'))).toBe(true);
    expect(stats.some(s => s.textContent?.includes('Fastest Trip'))).toBe(true);
  });

  it('should wrap fastest trip stat with RequestsMapModal', () => {
    render(<SpeedCharts {...mockProps} />);
    const modals = screen.getAllByTestId('requests-map-modal');
    const fastestModal = modals.find(m => m.getAttribute('data-title') === 'Fastest Trip');
    expect(fastestModal).toBeInTheDocument();
    expect(fastestModal).toHaveAttribute('data-rows', JSON.stringify([mockFastestTripRow]));
  });

  it('should wrap slowest trip stat with RequestsMapModal', () => {
    render(<SpeedCharts {...mockProps} />);
    const modals = screen.getAllByTestId('requests-map-modal');
    const slowestModal = modals.find(m => m.getAttribute('data-title') === 'Slowest Trip');
    expect(slowestModal).toBeInTheDocument();
    expect(slowestModal).toHaveAttribute('data-rows', JSON.stringify([mockSlowestTripRow]));
  });
});
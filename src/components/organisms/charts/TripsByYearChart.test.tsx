import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TripsByYearChart from './TripsByYearChart';
import { TripStats } from '../../../hooks/useTripData';
import { DistanceUnit } from '../../../App';

// Mock child components and dependencies
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children, data }: { children: React.ReactNode, data: any[] }) => <div data-testid="area-chart" data-data={JSON.stringify(data)}>{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Area: () => <div />,
  defs: () => <div />,
  linearGradient: () => <div />,
  stop: () => <div />,
}));

const mockTripData: TripStats = {
  tripsByYear: [
    { year: '2022', count: 50, totalDistance: 250 },
    { year: '2023', count: 100, totalDistance: 500 },
  ],
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
  distanceUnit: 'miles' as DistanceUnit,
  activeCurrency: 'USD',
};

describe('TripsByYearChart', () => {
  it('should render the area chart and metric buttons', () => {
    render(<TripsByYearChart {...mockProps} />);
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Total Trips' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Total Distance' })).toBeInTheDocument();
  });

  it('should display data by "Total Trips" by default', () => {
    render(<TripsByYearChart {...mockProps} />);
    const areaChart = screen.getByTestId('area-chart');
    // The dataKey is 'count' by default, but we can't directly check that.
    // Instead, we check the data passed to the chart, which is the full tripsByYear array.
    const chartData = JSON.parse(areaChart.getAttribute('data-data') || '[]');
    expect(chartData[0].count).toBe(50);
  });

  it('should switch to "Total Distance" when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<TripsByYearChart {...mockProps} />);

    const distanceButton = screen.getByRole('button', { name: 'Total Distance' });
    await user.click(distanceButton);

    const areaChart = screen.getByTestId('area-chart');
    const chartData = JSON.parse(areaChart.getAttribute('data-data') || '[]');
    expect(chartData[0].totalDistance).toBe(250);
  });

  it('should return null if there is no data', () => {
    const { container } = render(<TripsByYearChart {...mockProps} data={{ ...mockTripData, tripsByYear: [] }} />);
    expect(container.firstChild).toBeNull();
  });
});
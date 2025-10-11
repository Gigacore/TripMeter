import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TripSummaryChart from './TripSummaryChart';
import { TripStats } from '../../../hooks/useTripData';
import React from 'react';

// Mock child components and dependencies
vi.mock('recharts', async () => {
  const originalModule = await vi.importActual('recharts');
  return {
    ...originalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    Sankey: ({ data, node }: { data: any, node: React.ReactElement }) => (
      <div data-testid="sankey-chart" data-data={JSON.stringify(data)} data-node-is-fn={typeof node === 'function'}>
        {data.nodes.map((n: any, index: number) => React.cloneElement(node, { key: index, payload: n }))}
      </div>
    ),
    Tooltip: () => <div />,
  };
});

vi.mock('../../atoms/Stat', () => ({
  default: ({ label, value, onClick }: { label: string; value: string | number; onClick?: () => void }) => (
    <div data-testid="stat" onClick={onClick}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('../../atoms/SankeyNode', () => ({
  default: ({ payload }: { payload: { name: string } }) => <div data-testid="sankey-node">{payload.name}</div>,
}));

const mockTripData: TripStats = {
  totalTrips: 100,
  successfulTrips: 70,
  riderCanceledTrips: 15,
  driverCanceledTrips: 10,
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
  onShowTripList: vi.fn(),
};

describe('TripSummaryChart', () => {
  it('should render the Sankey chart and stats', () => {
    render(<TripSummaryChart {...mockProps} />);
    expect(screen.getByTestId('sankey-chart')).toBeInTheDocument();

    const stats = screen.getAllByTestId('stat');
    expect(stats.length).toBe(5); // Including unfulfilled
    expect(screen.getByText('Total Requests', { selector: 'span' })).toBeInTheDocument();
  });

  it('should calculate and display unfulfilled trips', () => {
    render(<TripSummaryChart {...mockProps} />);
    const unfulfilledStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Unfulfilled'));
    expect(unfulfilledStat).toBeInTheDocument();
    expect(unfulfilledStat).toHaveTextContent('5'); // 100 - 70 - 15 - 10 = 5
  });

  it('should call onShowTripList with correct type when a stat is clicked', async () => {
    const user = userEvent.setup();
    render(<TripSummaryChart {...mockProps} />);

    const successfulStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Successful'));
    if (successfulStat) {
      await user.click(successfulStat);
      expect(mockProps.onShowTripList).toHaveBeenCalledWith('successful-map');
    }
  });

  it('should call onShowTripList with "all-map" when Total Requests stat is clicked', async () => {
    const user = userEvent.setup();
    render(<TripSummaryChart {...mockProps} />);

    const totalRequestsStat = screen.getAllByTestId('stat').find(s => s.textContent?.includes('Total Requests'));
    if (totalRequestsStat) {
      await user.click(totalRequestsStat);
      expect(mockProps.onShowTripList).toHaveBeenCalledWith('all-map');
    }
  });

  it('should return null if there are no trips', () => {
    const noTripData = { ...mockTripData, totalTrips: 0, successfulTrips: 0, riderCanceledTrips: 0, driverCanceledTrips: 0 };
    const { container } = render(<TripSummaryChart {...mockProps} data={noTripData} />);
    expect(container.firstChild).toBeNull();
  });

});
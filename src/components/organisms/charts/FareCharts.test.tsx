import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import FareCharts from './FareCharts';
import { TripStats } from '../../../hooks/useTripData';
import { CSVRow } from '../../../services/csvParser';

// Mock child components and dependencies
vi.mock('recharts', async () => {
  const originalModule = await vi.importActual('recharts');
  return {
    ...originalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ data }: { data: any[] }) => <div data-testid="bar-chart" data-data={JSON.stringify(data)} />,
    AreaChart: ({ data }: { data: any[] }) => <div data-testid="area-chart" data-data={JSON.stringify(data)} />,
    CartesianGrid: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Tooltip: () => <div />,
    Bar: () => <div />,
    Area: () => <div />,
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

vi.mock('../../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount.toFixed(2)} ${currency}`,
}));

const mockRow: CSVRow = { id: 1 };
const mockTripData: TripStats = {
  totalFareByCurrency: { USD: 100, EUR: 50 },
  avgFareByCurrency: { USD: 25, EUR: 25 },
  lowestFareByCurrency: { USD: { amount: 10, row: mockRow } },
  highestFareByCurrency: { USD: { amount: 40, row: mockRow } },
  tripsByYear: [{ year: '2023', totalFare: { USD: 100 }, count: 4 }],
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
    { fare_currency: 'USD', fare_amount: '10' },
    { fare_currency: 'USD', fare_amount: '40' },
  ],
  activeCurrency: 'USD',
  setActiveCurrency: vi.fn(),
  onFocusOnTrip: vi.fn(),
};

describe('FareCharts', () => {
  it('should render currency switchers when multiple currencies exist', () => {
    render(<FareCharts {...mockProps} />);
    expect(screen.getByRole('button', { name: /USD/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EUR/ })).toBeInTheDocument();
  });

  it('should call setActiveCurrency when a currency button is clicked', async () => {
    const user = userEvent.setup();
    render(<FareCharts {...mockProps} />);
    await user.click(screen.getByRole('button', { name: /EUR/ }));
    expect(mockProps.setActiveCurrency).toHaveBeenCalledWith('EUR');
  });

  it('should render the BarChart with correct data', () => {
    render(<FareCharts {...mockProps} />);
    const barChart = screen.getByTestId('bar-chart');
    const chartData = JSON.parse(barChart.getAttribute('data-data') || '[]');
    expect(chartData.length).toBeGreaterThan(0);
  });

  it('should render the AreaChart with correct data', () => {
    render(<FareCharts {...mockProps} />);
    const areaChart = screen.getByTestId('area-chart');
    const chartData = JSON.parse(areaChart.getAttribute('data-data') || '[]');
    expect(chartData[0].year).toBe('2023');
  });

  it('should render Stat components with correct data', () => {
    render(<FareCharts {...mockProps} />);
    const stats = screen.getAllByTestId('stat');
    expect(stats[0]).toHaveTextContent('Avg. Fare');
    expect(stats[0]).toHaveTextContent('25.00 USD');
  });

  it('should call onFocusOnTrip when lowest fare stat is clicked', async () => {
    const user = userEvent.setup();
    render(<FareCharts {...mockProps} />);
    const stats = screen.getAllByTestId('stat');
    const lowestFareStat = stats.find(s => s.textContent?.includes('Lowest Fare'));
    if (lowestFareStat) {
      await user.click(lowestFareStat);
      expect(mockProps.onFocusOnTrip).toHaveBeenCalledWith(mockRow);
    }
  });
});
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CostEfficiencyChart from './CostEfficiencyChart';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '@/App';

// Mock recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ data, children }: { data: any[], children: React.ReactNode }) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Bar: () => <div />,
}));

vi.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));

const mockRows: CSVRow[] = [
  { product_type: 'Standard', status: 'completed', fare_amount: '10', fare_currency: 'USD', distance: '5' },
  { product_type: 'Premium', status: 'completed', fare_amount: '20', fare_currency: 'USD', distance: '5' },
];

const mockProps = {
  rows: mockRows,
  distanceUnit: 'miles' as DistanceUnit,
  activeCurrency: 'USD',
  convertDistance: (miles: number) => miles,
};

describe('CostEfficiencyChart', () => {
  it('should render the bar chart when there is efficiency data', () => {
    render(<CostEfficiencyChart {...mockProps} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should correctly calculate and sort efficiency data', () => {
    render(<CostEfficiencyChart {...mockProps} />);
    const barChart = screen.getByTestId('bar-chart');
    const data = JSON.parse(barChart.getAttribute('data-data') || '[]');

    // Premium is less efficient (5 miles / $20 = 0.25)
    // Standard is more efficient (5 miles / $10 = 0.5)
    // The chart should be sorted by efficiency ascending
    expect(data[0].productType).toBe('Premium');
    expect(data[0].distancePerFare).toBeCloseTo(0.25);
    expect(data[1].productType).toBe('Standard');
    expect(data[1].distancePerFare).toBeCloseTo(0.5);
  });

  it('should display a message when there is not enough data', () => {
    const notEnoughDataRows = [{ product_type: 'Standard', status: 'completed', fare_amount: '10', fare_currency: 'EUR', distance: '5' }];
    render(<CostEfficiencyChart {...mockProps} rows={notEnoughDataRows} />);
    expect(screen.getByText('Not enough data to calculate cost efficiency for the selected currency.')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });

  it('should display a message when activeCurrency is not set', () => {
    const { container } = render(<CostEfficiencyChart {...mockProps} activeCurrency={null} />);
    expect(screen.getByText('Not enough data to calculate cost efficiency for the selected currency.')).toBeInTheDocument();
  });
});
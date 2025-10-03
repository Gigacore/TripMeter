import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FareDistanceScatterPlot from './FareDistanceScatterPlot';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';

// Mock recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  ScatterChart: ({ children }: { children: React.ReactNode }) => <div data-testid="scatter-chart">{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Scatter: ({ data }: { data: any[] }) => <div data-testid="scatter-data" data-data={JSON.stringify(data)} />,
}));

vi.mock('../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));

const mockRows: CSVRow[] = [
  { status: 'completed', fare_currency: 'USD', distance: '5', fare_amount: '10' },
  { status: 'completed', fare_currency: 'USD', distance: '10', fare_amount: '20' },
  { status: 'rider_canceled', fare_currency: 'USD', distance: '2', fare_amount: '5' },
  { status: 'completed', fare_currency: 'EUR', distance: '8', fare_amount: '15' },
];

const mockProps = {
  rows: mockRows,
  distanceUnit: 'miles' as DistanceUnit,
  activeCurrency: 'USD',
  convertDistance: (miles: number) => miles,
};

describe('FareDistanceScatterPlot', () => {
  it('should render the scatter chart when there is data', () => {
    render(<FareDistanceScatterPlot {...mockProps} />);
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
  });

  it('should filter and process data correctly', () => {
    render(<FareDistanceScatterPlot {...mockProps} />);
    const scatterDataElement = screen.getByTestId('scatter-data');
    const data = JSON.parse(scatterDataElement.getAttribute('data-data') || '[]');

    expect(data).toHaveLength(2); // Only two trips are completed and in USD
    expect(data[0].distance).toBe(5);
    expect(data[0].fare).toBe(10);
    expect(data[1].distance).toBe(10);
    expect(data[1].fare).toBe(20);
  });

  it('should display a message when there is not enough data', () => {
    render(<FareDistanceScatterPlot {...mockProps} activeCurrency="GBP" />);
    expect(screen.getByText('Not enough data to display fare vs. distance for the selected currency.')).toBeInTheDocument();
    expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();
  });

  it('should display a message when activeCurrency is not set', () => {
    render(<FareDistanceScatterPlot {...mockProps} activeCurrency={null} />);
    expect(screen.getByText('Not enough data to display fare vs. distance for the selected currency.')).toBeInTheDocument();
  });
});
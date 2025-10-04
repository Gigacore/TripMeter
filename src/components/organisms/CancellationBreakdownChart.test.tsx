import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CancellationBreakdownChart from './CancellationBreakdownChart';Res
import { CSVRow } from '../../services/csvParser';

// Mock recharts library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ data, children }: { data: any[], children: React.ReactNode }) => <div data-testid="bar-chart" data-data={JSON.stringify(data)}>{children}</div>,
  CartesianGrid: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  Bar: () => <div />,
}));

const mockRows: CSVRow[] = [
  { status: 'rider_canceled', request_time: '2023-01-01T10:30:00Z' },
  { status: 'driver_canceled', request_time: '2023-01-01T10:50:00Z' },
  { status: 'rider_canceled', request_time: '2023-01-01T11:20:00Z' },
  { status: 'completed', request_time: '2023-01-01T12:00:00Z' },
];

describe('CancellationBreakdownChart', () => {
  it('should render the bar chart when there is cancellation data', () => {
    render(<CancellationBreakdownChart rows={mockRows} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should correctly process cancellation data by hour', () => {
    render(<CancellationBreakdownChart rows={mockRows} />);
    const barChart = screen.getByTestId('bar-chart');
    const data = JSON.parse(barChart.getAttribute('data-data') || '[]');

    const hour10Data = data.find((d: any) => d.hour === 10);
    const hour11Data = data.find((d: any) => d.hour === 11);

    expect(hour10Data.riderCanceled).toBe(1);
    expect(hour10Data.driverCanceled).toBe(1);
    expect(hour11Data.riderCanceled).toBe(1);
    expect(hour11Data.driverCanceled).toBe(0);
  });

  it('should display a message when there is no cancellation data', () => {
    const noCancellationRows = [{ status: 'completed', request_time: '2023-01-01T10:00:00Z' }];
    render(<CancellationBreakdownChart rows={noCancellationRows} />);
    expect(screen.getByText('No cancellation data to display.')).toBeInTheDocument();
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
  });
});
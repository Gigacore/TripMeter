import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProductTypesChart from './ProductTypesChart';
import { CSVRow } from '../../../services/csvParser';
import { DistanceUnit } from '../../../App';

// Mock child components and dependencies
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  Treemap: ({ data }: { data: any[] }) => (
    <div data-testid="treemap" data-data={JSON.stringify(data)} />
  ),
  Tooltip: () => <div />,
}));

vi.mock('../../../utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));

vi.mock('../../../utils/formatters', () => ({
  formatDuration: (minutes: number) => `${minutes} min`,
}));

const mockRows: CSVRow[] = [
  { product_type: 'Standard', status: 'completed', fare_amount: '10', fare_currency: 'USD' },
  { product_type: 'Standard', status: 'rider_canceled' },
  { product_type: 'Premium', status: 'completed', fare_amount: '20', fare_currency: 'USD' },
];

const mockProps = {
  rows: mockRows,
  distanceUnit: 'miles' as DistanceUnit,
  activeCurrency: 'USD',
};

describe('ProductTypesChart', () => {
  it('should render the metric buttons and the treemap', () => {
    render(<ProductTypesChart {...mockProps} />);
    expect(screen.getByRole('button', { name: 'Requests' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Completed' })).toBeInTheDocument();
    expect(screen.getByTestId('treemap')).toBeInTheDocument();
  });

  it('should process data correctly for the default "Requests" metric', () => {
    render(<ProductTypesChart {...mockProps} />);
    const treemap = screen.getByTestId('treemap');
    const data = JSON.parse(treemap.getAttribute('data-data') || '[]');
    const standardData = data.find((d: any) => d.name === 'Standard');
    expect(standardData.value).toBe(2); // 2 requests for Standard
  });

  it('should update data when a new metric is selected', async () => {
    const user = userEvent.setup();
    render(<ProductTypesChart {...mockProps} />);

    const completedButton = screen.getByRole('button', { name: 'Completed' });
    await user.click(completedButton);

    const treemap = screen.getByTestId('treemap');
    const data = JSON.parse(treemap.getAttribute('data-data') || '[]');
    const standardData = data.find((d: any) => d.name === 'Standard');
    expect(standardData.value).toBe(1); // 1 completed trip for Standard
  });

  it('should disable the "Total Fare" button when activeCurrency is null', () => {
    render(<ProductTypesChart {...mockProps} activeCurrency={null} />);
    expect(screen.getByRole('button', { name: 'Total Fare' })).toBeDisabled();
  });

  it('should return null if there are no rows', () => {
    const { container } = render(<ProductTypesChart {...mockProps} rows={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
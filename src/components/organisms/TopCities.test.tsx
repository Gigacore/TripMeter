import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TopCities from './TopCities';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';

vi.mock('./Map', () => ({
  default: (props: { rows: CSVRow[] }) => <div data-testid="map" data-rows={JSON.stringify(props.rows)} />,
}));

vi.mock('@/utils/currency', () => ({
  formatCurrency: (amount: number, currency: string) => `${amount} ${currency}`,
}));

vi.mock('@/utils/formatters', () => ({
  formatDuration: (minutes: number) => `${minutes} min`,
}));

const mockRows: CSVRow[] = [
  { city: 'A', status: 'completed', fare_amount: '10', fare_currency: 'USD', distance: '5' },
  { city: 'A', status: 'completed', fare_amount: '15', fare_currency: 'USD', distance: '10' },
  { city: 'B', status: 'completed', fare_amount: '20', fare_currency: 'EUR', distance: '15' },
  { city: 'A', status: 'cancelled', fare_amount: '5', fare_currency: 'USD', distance: '2' },
  { city: 'C', status: 'completed', fare_amount: '30', fare_currency: 'USD', distance: '20' },
];

const mockProps = {
  rows: mockRows,
  distanceUnit: 'miles' as DistanceUnit,
  convertDistance: (miles: number) => miles,
};

describe('TopCities', () => {
  it('should be accessible', async () => {
    await assertAccessible(<TopCities {...mockProps} />);
  });

  it('should render top cities sorted by trip count', async () => {
    render(<TopCities {...mockProps} />);
    const cityButtons = await screen.findAllByRole('button');
    // Expecting buttons for City A, B, C
    expect(cityButtons).toHaveLength(3);
    expect(cityButtons[0]).toHaveTextContent('1. A');
    expect(cityButtons[0]).toHaveTextContent('2'); // Count for city A
    expect(cityButtons[1]).toHaveTextContent('2. B');
    expect(cityButtons[2]).toHaveTextContent('3. C');
  });

  it('should select the top city by default and show its stats and map', async () => {
    render(<TopCities {...mockProps} />);
    expect(await screen.findByText('25 USD')).toBeInTheDocument(); // Total fare for city A
    expect(await screen.findByText('15.00 miles')).toBeInTheDocument(); // Total distance for city A

    const map = await screen.findByTestId('map');
    const mapRows = JSON.parse(map.getAttribute('data-rows') || '[]');
    expect(mapRows).toHaveLength(2); // Two completed trips for city A
    expect(mapRows[0].city).toBe('A');
  });

  it('should update stats and map when a different city is clicked', async () => {
    const user = userEvent.setup();
    render(<TopCities {...mockProps} />);

    // Wait for initial render and stats
    await screen.findByText('25 USD');

    const cityBButton = screen.getByRole('button', { name: /2\. B/ });
    await user.click(cityBButton);

    // Check for city B's stats
    expect(await screen.findByText('20 EUR')).toBeInTheDocument();
    expect(await screen.findByText('15.00 miles')).toBeInTheDocument();

    const map = await screen.findByTestId('map');
    const mapRows = JSON.parse(map.getAttribute('data-rows') || '[]');
    expect(mapRows).toHaveLength(1);
    expect(mapRows[0].city).toBe('B');
  });
});
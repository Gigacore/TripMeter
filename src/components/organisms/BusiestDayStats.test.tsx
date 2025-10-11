import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BusiestDayStats from './BusiestDayStats';
import { CSVRow } from '../../services/csvParser';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Route: () => <div data-testid="route-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Hourglass: () => <div data-testid="hourglass-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
}));

const mockTrips: CSVRow[] = [
  {
    distance: '10.5',
    fare_amount: '25.5',
    fare_currency: 'USD',
    begin_trip_time: '2023-01-01T10:00:00Z',
    dropoff_time: '2023-01-01T10:30:00Z',
    request_time: '2023-01-01T09:55:00Z',
  },
  {
    distance: '5.2',
    fare_amount: '15.0',
    fare_currency: 'USD',
    begin_trip_time: '2023-01-01T11:00:00Z',
    dropoff_time: '2023-01-01T11:15:00Z',
    request_time: '2023-01-01T10:50:00Z',
  },
  {
    distance: '8.0',
    fare_amount: '20.0',
    fare_currency: 'EUR',
    begin_trip_time: '2023-01-01T12:00:00Z',
    dropoff_time: '2023-01-01T12:20:00Z',
    request_time: '2023-01-01T11:58:00Z',
  },
];

describe('BusiestDayStats', () => {
  it('should render the correct stats for a given set of trips', () => {
    render(<BusiestDayStats trips={mockTrips} />);

    expect(screen.getByText('Total Distance')).toBeInTheDocument();
    expect(screen.getByText('23.70 miles')).toBeInTheDocument();

    expect(screen.getByText('Total Riding Time')).toBeInTheDocument();
    expect(screen.getByText('1h 5min')).toBeInTheDocument();

    expect(screen.getByText('Total Waiting Time')).toBeInTheDocument();
    expect(screen.getByText('17min')).toBeInTheDocument();

    expect(screen.getByText('Total Fare')).toBeInTheDocument();
    expect(screen.getByText('$40.50')).toBeInTheDocument();
    expect(screen.getByText('€20.00')).toBeInTheDocument();
  });

  it('should handle trips with invalid data gracefully', () => {
    const invalidTrips: CSVRow[] = [
      {
        distance: 'invalid',
        fare_amount: '25.5',
        fare_currency: 'USD',
        begin_trip_time: '2023-01-01T10:00:00Z',
        dropoff_time: '2023-01-01T10:30:00Z',
        request_time: '2023-01-01T09:55:00Z',
      },
      {
        distance: '5.2',
        fare_amount: 'invalid',
        fare_currency: 'USD',
        begin_trip_time: '2023-01-01T11:00:00Z',
        dropoff_time: '2023-01-01T11:15:00Z',
        request_time: '2023-01-01T10:50:00Z',
      },
    ];
    render(<BusiestDayStats trips={invalidTrips} />);

    expect(screen.getByText('Total Distance')).toBeInTheDocument();
    expect(screen.getByText('5.20 miles')).toBeInTheDocument();

    expect(screen.getByText('Total Fare')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  it('should render zero values when there are no trips', () => {
    render(<BusiestDayStats trips={[]} />);

    const distanceStat = screen.getByText('Total Distance').parentElement!;
    expect(within(distanceStat).getByText('0.00 miles')).toBeInTheDocument();

    const ridingTimeStat = screen.getByText('Total Riding Time').parentElement!;
    expect(within(ridingTimeStat).getByText('0 minutes')).toBeInTheDocument();

    const waitingTimeStat = screen.getByText('Total Waiting Time').parentElement!;
    expect(within(waitingTimeStat).getByText('0 minutes')).toBeInTheDocument();
  });
});
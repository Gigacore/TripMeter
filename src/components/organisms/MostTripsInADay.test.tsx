import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MostTripsInADay from './MostTripsInADay';
import { CSVRow } from '../../services/csvParser';

// Mock child components
vi.mock('@/components/ui/card', async () => {
  const actual = await vi.importActual('@/components/ui/card');
  return {
    ...actual,
    Card: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  };
});

vi.mock('lucide-react', () => ({
  Trophy: () => <div data-testid="trophy-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Maximize: () => <div data-testid="maximize-icon" />,
}));

vi.mock('./Map', () => ({
  default: ({ focusedTrip }: { focusedTrip: CSVRow | null }) => (
    <div data-testid="map">
      {focusedTrip && <div data-testid="focused-trip-id">{focusedTrip.trip_uuid}</div>}
    </div>
  ),
}));

vi.mock('./BusiestDayStats', () => ({
  default: () => <div data-testid="busiest-day-stats" />,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className} data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

const mockMostTripsInADay = {
  count: 3,
  date: new Date('2023-01-01T00:00:00Z').getTime(),
  trips: [
    { trip_uuid: '1', request_time: '2023-01-01T10:00:00Z', begintrip_address: 'Address A', dropoff_address: 'Address B' },
    { trip_uuid: '2', request_time: '2023-01-01T11:00:00Z', begintrip_address: 'Address B', dropoff_address: 'Address C' },
    { trip_uuid: '3', request_time: '2023-01-01T12:00:00Z', begintrip_address: 'Address C', dropoff_address: 'Address D' },
  ],
};

describe('MostTripsInADay', () => {
  it('should render null if trip count is less than 2', () => {
    const { container } = render(<MostTripsInADay mostTripsInADay={{ count: 1, date: null, trips: [] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the summary card with correct data', () => {
    render(<MostTripsInADay mostTripsInADay={mockMostTripsInADay} />);
    const summaryCard = screen.getByTestId('dialog-trigger').parentElement!;
    expect(within(summaryCard).getByText('Busiest Day')).toBeInTheDocument();
    expect(within(summaryCard).getByText('3')).toBeInTheDocument();
    expect(within(summaryCard).getByText(/on January 1, 2023/)).toBeInTheDocument();
  });

  it('should render dialog with detailed information', () => {
    render(<MostTripsInADay mostTripsInADay={mockMostTripsInADay} />);
    const dialogContent = screen.getByTestId('dialog-content');
    expect(within(dialogContent).getByText('Busiest Day Details')).toBeInTheDocument();
    expect(within(dialogContent).getByTestId('busiest-day-stats')).toBeInTheDocument();
    expect(within(dialogContent).getByText('Trip #1')).toBeInTheDocument();
    expect(within(dialogContent).getByText('Trip #2')).toBeInTheDocument();
    expect(within(dialogContent).getByText('Trip #3')).toBeInTheDocument();
    expect(within(dialogContent).getByTestId('map')).toBeInTheDocument();
  });

  it('should select a trip and update the map on click', async () => {
    const user = userEvent.setup();
    render(<MostTripsInADay mostTripsInADay={mockMostTripsInADay} />);

    const trip2Container = screen.getByText('Trip #2').parentElement!.parentElement!;
    await user.click(trip2Container);

    const map = screen.getByTestId('map');
    const focusedTripId = within(map).getByTestId('focused-trip-id');
    expect(focusedTripId).toHaveTextContent('2');

    expect(trip2Container).toHaveClass('bg-primary/10');
  });
});
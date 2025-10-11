import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConsecutiveTrips from './ConsecutiveTrips';
import { CSVRow } from '../../services/csvParser';

// Mock child components and dependencies
vi.mock('@/components/ui/card', async () => {
  const actual = await vi.importActual('@/components/ui/card');
  return {
    ...actual,
    Card: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>,
    CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  };
});

vi.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon" />,
  Maximize: () => <div data-testid="maximize-icon" />,
  Link2: () => <div data-testid="link2-icon" />,
}));

vi.mock('./Map', () => ({
  default: ({ focusedTrip }: { focusedTrip: CSVRow | null }) => (
    <div data-testid="map">
      {focusedTrip && <div data-testid="focused-trip-id">{focusedTrip.trip_uuid}</div>}
    </div>
  ),
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

const mockTripChain: CSVRow[] = [
  { trip_uuid: '1', request_time: '2023-01-01T10:00:00Z', begintrip_address: 'Address A', dropoff_address: 'Address B' },
  { trip_uuid: '2', request_time: '2023-01-01T11:00:00Z', begintrip_address: 'Address B', dropoff_address: 'Address C' },
  { trip_uuid: '3', request_time: '2023-01-01T12:00:00Z', begintrip_address: 'Address C', dropoff_address: 'Address D' },
];

const mockOnFocusOnTrip = vi.fn();

describe('ConsecutiveTrips', () => {
  it('should render "no chains" message when tripChain is short', () => {
    render(<ConsecutiveTrips tripChain={[]} onFocusOnTrip={mockOnFocusOnTrip} />);
    expect(screen.getByText('No consecutive trip chains of 2 or more trips found.')).toBeInTheDocument();
  });

  it('should render the card with trip chain info', () => {
    render(<ConsecutiveTrips tripChain={mockTripChain} onFocusOnTrip={mockOnFocusOnTrip} />);
    const cardSummary = screen.getByText("Your longest chain of consecutive trips in a single day.").parentElement.parentElement;
    expect(within(cardSummary).getByText('Trip Chain')).toBeInTheDocument();
    expect(within(cardSummary).getByText('3')).toBeInTheDocument();
    expect(within(cardSummary).getByText('Trips')).toBeInTheDocument();
  });

  it('should render the dialog with trip details', () => {
    render(<ConsecutiveTrips tripChain={mockTripChain} onFocusOnTrip={mockOnFocusOnTrip} />);
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText(/You had a chain of/)).toBeInTheDocument();
    expect(screen.getByText('Trip #1')).toBeInTheDocument();
    expect(screen.getByText('Trip #2')).toBeInTheDocument();
    expect(screen.getByText('Trip #3')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should call onFocusOnTrip and update selected trip on click', async () => {
    const user = userEvent.setup();
    render(<ConsecutiveTrips tripChain={mockTripChain} onFocusOnTrip={mockOnFocusOnTrip} />);

    const trip1Container = screen.getByText('Trip #1').parentElement!.parentElement!;
    await user.click(trip1Container);

    expect(mockOnFocusOnTrip).toHaveBeenCalledWith(mockTripChain[0]);

    const map = screen.getByTestId('map');
    const focusedTripId = within(map).getByTestId('focused-trip-id');
    expect(focusedTripId).toHaveTextContent('1');

    expect(trip1Container).toHaveClass('bg-primary/10');
  });
});
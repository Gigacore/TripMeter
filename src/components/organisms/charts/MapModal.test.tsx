import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MapModal from './MapModal';
import { CSVRow } from '@/services/csvParser';
import { DistanceUnit } from '@/App';

// Mock child components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className} data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
}));

vi.mock('../Map', () => ({
  default: ({ focusedTrip }: { focusedTrip: CSVRow | null }) => (
    <div data-testid="map">
      {focusedTrip && <div data-testid="focused-trip-id">{focusedTrip['Request id']}</div>}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  CheckCircle2: () => <div data-testid="check-icon" />,
  HelpCircle: () => <div data-testid="help-icon" />,
  ShieldX: () => <div data-testid="shieldx-icon" />,
  UserX: () => <div data-testid="userx-icon" />,
}));

vi.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

const mockRows: CSVRow[] = [
  { 'Request id': '1', request_time: '2023-01-01T10:00:00Z', 'From address': 'Address A', 'To address': 'Address B', status: 'completed' },
  { 'Request id': '2', request_time: '2023-01-01T11:00:00Z', 'Begin Trip Address': 'Address C', 'Dropoff Address': 'Address D', status: 'driver_canceled' },
];

const defaultProps = {
  rows: mockRows,
  distanceUnit: 'miles' as DistanceUnit,
  convertDistance: (m: number) => m,
  isOpen: true,
  onClose: vi.fn(),
  title: 'Test Modal',
};

describe('MapModal', () => {
  it('should not render when isOpen is false', () => {
    const { container } = render(<MapModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render the dialog with title and content when isOpen is true', () => {
    render(<MapModal {...defaultProps} />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('All Requests (2)')).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
  });

  it('should select and deselect a trip on click', async () => {
    const user = userEvent.setup();
    render(<MapModal {...defaultProps} />);

    const map = screen.getByTestId('map');
    // Wait for the initial trip to be focused
    await within(map).findByTestId('focused-trip-id');

    const trip1 = screen.getByText('Address A').closest('li');
    expect(trip1).not.toBeNull();

    // Select trip
    await user.click(trip1!);
    expect(within(map).getByTestId('focused-trip-id')).toHaveTextContent('1');
    expect(trip1).toHaveClass('bg-muted');

    // Deselect trip
    await user.click(trip1!);
    expect(within(map).queryByTestId('focused-trip-id')).not.toBeInTheDocument();
    expect(trip1).not.toHaveClass('bg-muted');
  });

  it('should render correct status icons', () => {
    render(<MapModal {...defaultProps} />);
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.getByTestId('shieldx-icon')).toBeInTheDocument();
  });
});
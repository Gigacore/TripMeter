import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RequestsMapModal from './RequestsMapModal';
import { CSVRow } from '../../services/csvParser';
import { DistanceUnit } from '../../App';

// Mock child components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className} data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h5>{children}</h5>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
}));

vi.mock('./Map', () => ({
  default: ({ focusedTrip }: { focusedTrip: CSVRow | null }) => (
    <div data-testid="map">
      {focusedTrip && <div data-testid="focused-trip-id">{focusedTrip.trip_uuid}</div>}
    </div>
  ),
}));

vi.mock('./TripList', () => ({
  default: ({ onFocusOnTrip, onBack }: { onFocusOnTrip: (trip: CSVRow) => void; onBack: () => void; }) => (
    <div data-testid="trip-list">
      <button onClick={() => onFocusOnTrip({ trip_uuid: 'trip-1' })}>Focus Trip 1</button>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

const mockRows: CSVRow[] = [
  { trip_uuid: 'trip-1' },
  { trip_uuid: 'trip-2' },
];

const mockProps = {
  rows: mockRows,
  distanceUnit: 'miles' as DistanceUnit,
  convertDistance: (m: number) => m,
};

describe('RequestsMapModal', () => {
  it('should render children as a trigger', () => {
    render(
      <RequestsMapModal {...mockProps}>
        <button>Open Modal</button>
      </RequestsMapModal>
    );
    const trigger = screen.getByTestId('dialog-trigger');
    expect(within(trigger).getByRole('button', { name: 'Open Modal' })).toBeInTheDocument();
  });

  it('should render TripList and Map in the dialog content', () => {
    render(
      <RequestsMapModal {...mockProps}>
        <button>Open Modal</button>
      </RequestsMapModal>
    );
    const dialogContent = screen.getByTestId('dialog-content');
    expect(within(dialogContent).getByTestId('trip-list')).toBeInTheDocument();
    expect(within(dialogContent).getByTestId('map')).toBeInTheDocument();
  });

  it('should focus on a trip when onFocusOnTrip is called from TripList', async () => {
    const user = userEvent.setup();
    render(
      <RequestsMapModal {...mockProps}>
        <button>Open Modal</button>
      </RequestsMapModal>
    );

    const tripList = screen.getByTestId('trip-list');
    await user.click(within(tripList).getByRole('button', { name: 'Focus Trip 1' }));

    const map = screen.getByTestId('map');
    const focusedTripId = within(map).getByTestId('focused-trip-id');
    expect(focusedTripId).toHaveTextContent('trip-1');
  });

  it('should clear the focused trip when onBack is called from TripList', async () => {
    const user = userEvent.setup();
    render(
      <RequestsMapModal {...mockProps}>
        <button>Open Modal</button>
      </RequestsMapModal>
    );

    const tripList = screen.getByTestId('trip-list');
    await user.click(within(tripList).getByRole('button', { name: 'Focus Trip 1' }));

    const map = screen.getByTestId('map');
    expect(within(map).getByTestId('focused-trip-id')).toBeInTheDocument();

    await user.click(within(tripList).getByRole('button', { name: 'Back' }));
    expect(within(map).queryByTestId('focused-trip-id')).not.toBeInTheDocument();
  });
});
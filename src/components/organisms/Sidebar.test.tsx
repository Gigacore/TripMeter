import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import { assertAccessible } from '../../tests/utils';
import { CSVRow } from '../../services/csvParser';

// Mock child components
vi.mock('./TripList', () => ({
  default: (props: any) => <div data-testid="trip-list" title={props.title} />,
}));

vi.mock('../molecules/FocusedTripInfo', () => ({
  default: ({ trip, onShowAll }: { trip: CSVRow, onShowAll: () => void}) => <div data-testid="focused-trip-info" {...{ trip, onShowAll }} />,
}));

// A more robust mock for the Tabs components
vi.mock('@/components/ui/tabs', async () => {
  const actual = await vi.importActual('@/components/ui/tabs');
  return {
    ...actual,
    Tabs: ({ children, onValueChange, value }: { children: React.ReactNode, onValueChange: (v: string) => void, value: string }) => (
      <div data-testid="tabs" data-value={value} onClick={() => onValueChange(value === 'stats' ? 'tripList' : 'stats')}>
        {children}
      </div>
    ),
    TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
    TabsTrigger: ({ children, value }: { children: React.ReactNode, value: string }) => <button data-testid={`tab-${value}`}>{children}</button>,
    TabsContent: ({ children, value }: { children: React.ReactNode, value: string }) => (
      <div data-testid={`tab-content-${value}`}>{children}</div>
    ),
  };
});

const mockProps = {
  focusedTrip: null,
  onShowAll: vi.fn(),
  sidebarView: 'stats' as 'stats' | 'tripList',
  onFocusOnTrip: vi.fn(),
  onShowTripList: vi.fn(),
  tripList: [{ id: 1 }],
  tripListTitle: 'Test Trips',
  onBackToStats: vi.fn(),
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be accessible', async () => {
    await assertAccessible(<Sidebar {...mockProps} />);
  });

  it('should not render FocusedTripInfo when no trip is focused', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.queryByTestId('focused-trip-info')).not.toBeInTheDocument();
  });

  it('should render FocusedTripInfo when a trip is focused', () => {
    const focusedTrip: CSVRow = { id: 2 };
    render(<Sidebar {...mockProps} focusedTrip={focusedTrip} />);
    expect(screen.getByTestId('focused-trip-info')).toBeInTheDocument();
  });

  it('should pass the correct props to TripList', () => {
    render(<Sidebar {...mockProps} sidebarView="tripList" />);
    const tripList = screen.getByTestId('trip-list');
    expect(tripList).toHaveAttribute('title', 'Test Trips');
  });

  it('should call onBackToStats when the stats tab is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar {...mockProps} sidebarView="tripList" />);

    // The mock for Tabs will call onValueChange with 'stats' when clicked
    const tabs = screen.getByTestId('tabs');
    await user.click(tabs);

    expect(mockProps.onBackToStats).toHaveBeenCalledTimes(1);
  });
});
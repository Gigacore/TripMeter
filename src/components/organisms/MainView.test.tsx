import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainView from './MainView';
import { assertAccessible } from '../../tests/utils';
import { DistanceUnit } from '../../App';
import Map from './Map';
import Stats from './Stats';

vi.mock('./Map', () => ({
    default: vi.fn(() => <div data-testid="map" />),
}));

vi.mock('./Stats', () => ({
    default: vi.fn(() => <div data-testid="stats" />),
}));

vi.mock('./Sidebar', () => ({
    default: vi.fn(() => <div data-testid="sidebar" />),
}));

const mockTripData = {
    totalDistance: 100,
    totalFare: 500,
    totalTrips: 10,
    averageDistance: 10,
    averageFare: 50,
    averageSpeed: 60,
    topPickups: [],
    topDropoffs: [],
    tripsByHour: [],
    tripsByDay: [],
    fareByDistance: [],
};

const mockProps = {
  rows: [{ id: 1 }],
  focusedTrip: null,
  distanceUnit: 'miles' as DistanceUnit,
  convertDistance: (miles: number) => miles,
  tripData: mockTripData,
  sidebarView: 'stats' as 'stats' | 'tripList',
  error: '',
  isProcessing: false,
  tripList: [],
  tripListTitle: '',
  onShowAll: vi.fn(),
  onFocusOnTrip: vi.fn(),
  onShowTripList: vi.fn(),
  onFileSelect: vi.fn(),
  onBackToStats: vi.fn(),
};

describe('MainView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be accessible', async () => {
    await assertAccessible(<MainView {...mockProps} />);
  });

  it('should render the Map and Stats components', () => {
    render(<MainView {...mockProps} />);
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByTestId('stats')).toBeInTheDocument();
  });

  it('should pass the correct props to the Map component', () => {
    render(<MainView {...mockProps} />);
    expect(Map).toHaveBeenCalledWith(
      expect.objectContaining({
        rows: mockProps.rows,
        focusedTrip: mockProps.focusedTrip,
        distanceUnit: mockProps.distanceUnit,
        convertDistance: mockProps.convertDistance,
      }),
      undefined
    );
  });

  it('should pass the correct props to the Stats component', () => {
    render(<MainView {...mockProps} />);
    expect(Stats).toHaveBeenCalledWith(
      expect.objectContaining({
        data: mockProps.tripData,
        onFocusOnTrip: mockProps.onFocusOnTrip,
        onShowTripList: mockProps.onShowTripList,
        distanceUnit: mockProps.distanceUnit,
        rows: mockProps.rows,
      }),
      undefined
    );
  });

  it('should not render the Sidebar component as it is commented out', () => {
    render(<MainView {...mockProps} />);
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });
});
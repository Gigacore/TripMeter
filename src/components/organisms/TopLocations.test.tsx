import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopLocations from './TopLocations';
import { CSVRow } from '../../services/csvParser';
import { featureCollection } from '@turf/helpers';

// Mock child components and dependencies
vi.mock('lucide-react', () => ({
  MapPin: () => <div data-testid="map-pin-icon" />,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange: (value: string) => void; value: string }) => (
    <div data-testid="select-container" onClick={() => onValueChange(value === 'all' ? 'Test City' : 'all')}>
      <div data-testid="select-value">{value}</div>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <div data-testid={`select-item-${value}`}>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <div />,
}));

vi.mock('./Map', () => ({
  default: ({ locations, selectedLocation }: { locations: any[]; selectedLocation: any | null }) => (
    <div data-testid="map">
      <div data-testid="locations-count">{locations.length}</div>
      {selectedLocation && <div data-testid="selected-location">{selectedLocation.commonAddress}</div>}
    </div>
  ),
}));

const { mockTurfClustersDbscan } = vi.hoisted(() => {
  return { mockTurfClustersDbscan: vi.fn() };
});
vi.mock('@turf/clusters-dbscan', () => ({
  default: mockTurfClustersDbscan,
}));

const mockRows: CSVRow[] = [
  // Pickup Cluster for "Test City"
  { status: 'completed', city: 'Test City', begintrip_lat: '40.7128', begintrip_lng: '-74.0060', begintrip_address: 'Address A' },
  { status: 'completed', city: 'Test City', begintrip_lat: '40.7129', begintrip_lng: '-74.0061', begintrip_address: 'Address A' },
  { status: 'completed', city: 'Test City', begintrip_lat: '40.7130', begintrip_lng: '-74.0062', begintrip_address: 'Address A' },
  // Dropoff Cluster for "Test City"
  { status: 'completed', city: 'Test City', dropoff_lat: '34.0522', dropoff_lng: '-118.2437', dropoff_address: 'Address B' },
  { status: 'completed', city: 'Test City', dropoff_lat: '34.0523', dropoff_lng: '-118.2438', dropoff_address: 'Address B' },
  { status: 'completed', city: 'Test City', dropoff_lat: '34.0524', dropoff_lng: '-118.2439', dropoff_address: 'Address B' },
  // Pickup Cluster for "Other City"
  { status: 'completed', city: 'Other City', begintrip_lat: '50.0', begintrip_lng: '50.0', begintrip_address: 'Address C' },
  { status: 'completed', city: 'Other City', begintrip_lat: '50.1', begintrip_lng: '50.1', begintrip_address: 'Address C' },
  { status: 'completed', city: 'Other City', begintrip_lat: '50.2', begintrip_lng: '50.2', begintrip_address: 'Address C' },
];

describe('TopLocations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTurfClustersDbscan.mockImplementation((points) => {
      const cityClusters: { [key: string]: number } = {};
      let clusterId = 0;
      points.features.forEach((f: any) => {
        const city = f.properties.trip.city;
        if (cityClusters[city] === undefined) {
          cityClusters[city] = clusterId++;
        }
        f.properties.cluster = cityClusters[city];
      });
      return points;
    });
  });

  it('should render a message when no completed trips are available', () => {
    render(<TopLocations rows={[{ status: 'incomplete' }]} />);
    expect(screen.getByText('No completed trips to analyze for top locations.')).toBeInTheDocument();
  });

  it('should render top locations and map', () => {
    render(<TopLocations rows={mockRows} />);
    expect(screen.getByText('Top Pickup & Drop-off Locations')).toBeInTheDocument();
    expect(screen.getByText('Address A')).toBeInTheDocument(); // Pickup from Test City
    expect(screen.getByText('Address B')).toBeInTheDocument(); // Dropoff from Test City
    expect(screen.getByText('Address C')).toBeInTheDocument(); // Pickup from Other City
  });

  it('should filter locations when a city is selected', async () => {
    const user = userEvent.setup();
    render(<TopLocations rows={mockRows} />);

    // Initially, all clusters are shown
    expect(screen.getByText('Address A')).toBeInTheDocument();
    expect(screen.getByText('Address C')).toBeInTheDocument();

    // Click the select to trigger a change to "Test City"
    const selectContainer = screen.getByTestId('select-container');
    await user.click(selectContainer);

    // After filtering, only "Test City" clusters should be visible
    expect(screen.getByText('Address A')).toBeInTheDocument();
    expect(screen.queryByText('Address C')).not.toBeInTheDocument();
  });

  it('should select and deselect a location on click', async () => {
    const user = userEvent.setup();
    render(<TopLocations rows={mockRows} />);

    const addressARow = screen.getByText('Address A').closest('tr');
    expect(addressARow).not.toBeNull();

    // Select
    await user.click(addressARow!);
    expect(addressARow).toHaveClass('bg-primary/10 dark:bg-primary/20');
    const selectedLocationOnMap = screen.getByTestId('selected-location');
    expect(selectedLocationOnMap).toHaveTextContent('Address A');

    // Deselect
    await user.click(addressARow!);
    expect(addressARow).not.toHaveClass('bg-primary/10 dark:bg-primary/20');
    expect(screen.queryByTestId('selected-location')).toBeNull();
  });
});
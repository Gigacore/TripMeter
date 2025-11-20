import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Map from './Map';
import { assertAccessible } from '../../tests/utils';
import L from 'leaflet';
import { DistanceUnit } from '../../App';

vi.mock('leaflet.heat', () => ({}));
vi.mock('leaflet-fullscreen', () => ({}));
vi.mock('leaflet-fullscreen/dist/leaflet.fullscreen.css', () => ({ default: {} }), { virtual: true });

const mapMock = {
  addTo: vi.fn().mockReturnThis(),
  fitBounds: vi.fn(),
  invalidateSize: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

const featureGroupMock = {
  addTo: vi.fn().mockReturnThis(),
  clearLayers: vi.fn(),
  addLayer: vi.fn(),
  getLayers: vi.fn(() => [1, 2]),
  getBounds: vi.fn(() => ({
    pad: vi.fn(),
    isValid: () => true,
  })),
};

const markerMock = {
  bindPopup: vi.fn(),
};

const heatLayerMock = {
    addTo: vi.fn().mockReturnThis(),
    setLatLngs: vi.fn(),
};

const fullscreenControlMock = {
    addTo: vi.fn(),
};

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mapMock),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    featureGroup: vi.fn(() => featureGroupMock),
    marker: vi.fn(() => markerMock),
    control: {
      layers: vi.fn(() => ({ addTo: vi.fn() })),
      fullscreen: vi.fn(() => fullscreenControlMock),
    },
    heatLayer: vi.fn(() => heatLayerMock),
  },
}));

vi.mock('../../constants', () => ({
  greenIcon: {},
  redIcon: {},
  blueIcon: {},
}));

vi.mock('../../utils/currency', () => ({
  formatCurrency: vi.fn((amount) => `$${amount}`),
}));

const mockProps = {
  rows: [
    {
      begintrip_lat: '40.7128',
      begintrip_lng: '-74.0060',
      dropoff_lat: '40.7580',
      dropoff_lng: '-73.9855',
      status: 'completed',
    },
  ],
  focusedTrip: null,
  distanceUnit: 'miles' as DistanceUnit,
  convertDistance: (miles: number) => miles,
};

describe('Map', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be accessible', async () => {
    await assertAccessible(<Map {...mockProps} />);
  });

  it('should initialize the map when rows are provided', () => {
    render(<Map {...mockProps} />);
    expect(L.map).toHaveBeenCalledWith(expect.stringContaining('map-'));
    expect(L.tileLayer).toHaveBeenCalled();
    expect(L.control.layers).toHaveBeenCalled();
    expect((L.control as any).fullscreen).toHaveBeenCalled();
    expect(fullscreenControlMock.addTo).toHaveBeenCalledWith(mapMock);
  });

  it('should not initialize the map if there are no rows', () => {
    render(<Map {...mockProps} rows={[]} />);
    expect(L.map).not.toHaveBeenCalled();
  });

  it('should add markers for each row', () => {
    render(<Map {...mockProps} />);
    expect(L.marker).toHaveBeenCalledTimes(2);
    expect(featureGroupMock.addLayer).toHaveBeenCalledTimes(2);
    expect(heatLayerMock.setLatLngs).toHaveBeenCalled();
  });

  it('should only add markers for the focused trip', () => {
    render(<Map {...mockProps} focusedTrip={mockProps.rows[0]} />);
    expect(L.marker).toHaveBeenCalledTimes(2);
  });

  it('should call fitBounds when there is no focused trip', () => {
    render(<Map {...mockProps} />);
    expect(mapMock.fitBounds).toHaveBeenCalled();
  });

  it('should call invalidateSize on layout change', () => {
    vi.useFakeTimers();
    const { rerender } = render(<Map {...mockProps} layout={{ width: 100 }} />);
    rerender(<Map {...mockProps} layout={{ width: 200 }} />);
    vi.runAllTimers();
    expect(mapMock.invalidateSize).toHaveBeenCalledWith({ pan: false });
    vi.useRealTimers();
  });
});
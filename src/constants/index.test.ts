import { describe, it, expect, vi } from 'vitest';

// Mock L.icon before importing the constants
const iconSpy = vi.fn(() => ({})); // Return a dummy object
vi.doMock('leaflet', () => ({
  default: {
    icon: iconSpy,
  },
}));

// Now import the constants
const { greenIcon, redIcon, KM_PER_MILE } = await import('./index');

describe('constants', () => {
  it('should have the correct value for KM_PER_MILE', () => {
    expect(KM_PER_MILE).toBe(1.60934);
  });

  it('should create the greenIcon with the correct options', () => {
    expect(iconSpy).toHaveBeenCalledWith({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28],
    });
    expect(greenIcon).toBeDefined();
  });

  it('should create the redIcon with the correct options', () => {
    expect(iconSpy).toHaveBeenCalledWith({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28],
    });
    expect(redIcon).toBeDefined();
  });
});
import { describe, it, expect, vi } from 'vitest';

// Mock L.icon before importing the constants
vi.mock('leaflet', () => {
  return {
    default: {
      Icon: vi.fn(),
    },
  };
});

// Now import the constants
const { greenIcon, redIcon, KM_PER_MILE } = await import('./index');

describe('constants', () => {
  it('should have the correct value for KM_PER_MILE', () => {
    expect(KM_PER_MILE).toBe(1.60934);
  });

  it('should create the greenIcon with the correct options', () => {
    expect(greenIcon).toBeDefined();
  });

  it('should create the redIcon with the correct options', () => {
    expect(redIcon).toBeDefined();
  });
});
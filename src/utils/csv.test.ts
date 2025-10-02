import { describe, it, expect } from 'vitest';
import { normalizeHeaders } from './csv';

describe('normalizeHeaders', () => {
  it('should return a map of header indexes when all required headers are present', () => {
    const headers = ['begintrip_lat', 'begintrip_lng', 'dropoff_lat', 'dropoff_lng', 'fare_amount'];
    const result = normalizeHeaders(headers);
    expect(result).toEqual({
      begintrip_lat: 0,
      begintrip_lng: 1,
      dropoff_lat: 2,
      dropoff_lng: 3,
      fare_amount: 4,
    });
  });

  it('should handle headers with extra whitespace and mixed case', () => {
    const headers = ['  BeginTrip_Lat  ', 'BeginTrip_Lng', 'Dropoff_Lat', 'Dropoff_Lng  '];
    const result = normalizeHeaders(headers);
    expect(result).toEqual({
      begintrip_lat: 0,
      begintrip_lng: 1,
      dropoff_lat: 2,
      dropoff_lng: 3,
    });
  });

  it('should return null if some required headers are missing', () => {
    const headers = ['begintrip_lat', 'begintrip_lng', 'fare_amount'];
    const result = normalizeHeaders(headers);
    expect(result).toBeNull();
  });

  it('should return null for an empty array of headers', () => {
    const headers: string[] = [];
    const result = normalizeHeaders(headers);
    expect(result).toBeNull();
  });
});
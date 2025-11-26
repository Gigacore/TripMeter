import { describe, it, expect } from 'vitest';
import { makeParts, buildKML } from './kmlService';
import { CSVRow } from './csvParser';

const mockRows: CSVRow[] = [
  { begintrip_lat: '40.7128', begintrip_lng: '-74.0060', dropoff_lat: '40.7580', dropoff_lng: '-73.9855' },
  { begintrip_lat: '34.0522', begintrip_lng: '-118.2437', dropoff_lat: null, dropoff_lng: null },
];

describe('kmlService', () => {
  describe('makeParts', () => {
    it('should create parts for both begin and dropoff points by default', () => {
      const parts = makeParts(mockRows);
      expect(parts).toHaveLength(3);
      expect(parts[0].name).toBe('Begintrip #1');
      expect(parts[1].name).toBe('Dropoff #1');
      expect(parts[2].name).toBe('Begintrip #2');
    });

    it('should create parts for only begin points when specified', () => {
      const parts = makeParts(mockRows, { which: 'begin' });
      expect(parts).toHaveLength(2);
      expect(parts[0].name).toBe('Begintrip #1');
      expect(parts[1].name).toBe('Begintrip #2');
    });

    it('should create parts for only dropoff points when specified', () => {
      const parts = makeParts(mockRows, { which: 'drop' });
      expect(parts).toHaveLength(1);
      expect(parts[0].name).toBe('Dropoff #1');
    });
  });

  describe('buildKML', () => {
    it('should build a KML string from parts', () => {
      const parts = makeParts(mockRows);
      const kml = buildKML(parts);
      expect(kml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(kml).toContain('<kml xmlns="http://www.opengis.net/kml/2.2">');
      expect(kml).toContain('<Placemark>');
      expect(kml).toContain('<name>Begintrip #1</name>');
      expect(kml).toContain('<coordinates>-74.006,40.7128,0</coordinates>');
      expect(kml).toContain('</Document>');
      expect(kml).toContain('</kml>');
    });
  });
});
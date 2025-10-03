import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileHandler } from './useFileHandler';
import * as csvParser from '../services/csvParser';

vi.mock('../services/csvParser', () => ({
  parseCSV: vi.fn(),
}));

describe('useFileHandler', () => {
  it('should have the correct initial state', () => {
    const { result } = renderHook(() => useFileHandler());

    expect(result.current.rows).toEqual([]);
    expect(result.current.error).toBe('');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isDragging).toBe(false);
  });

  it('should handle a valid CSV file selection', async () => {
    const { result } = renderHook(() => useFileHandler());
    const mockFile = new File(['begintrip_lat,begintrip_lng,dropoff_lat,dropoff_lng\n1,2,3,4'], 'test.csv', { type: 'text/csv' });
    const mockEvent = { target: { files: [mockFile] } } as React.ChangeEvent<HTMLInputElement>;
    const mockParsedData = {
      data: [{ begintrip_lat: '1', begintrip_lng: '2', dropoff_lat: '3', dropoff_lng: '4' }],
      meta: { fields: ['begintrip_lat', 'begintrip_lng', 'dropoff_lat', 'dropoff_lng'] },
    };

    vi.spyOn(csvParser, 'parseCSV').mockResolvedValue(mockParsedData as any);

    await act(async () => {
      result.current.handleFileSelect(mockEvent);
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].begintrip_lat).toBe('1');
    expect(result.current.error).toBe('');
  });

  it('should show an error for a non-CSV file', async () => {
    const { result } = renderHook(() => useFileHandler());
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const mockEvent = { target: { files: [mockFile] } } as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      result.current.handleFileSelect(mockEvent);
    });

    expect(result.current.error).toBe('Please select a .csv file.');
    expect(result.current.rows).toEqual([]);
  });

  it('should show an error for a CSV with missing headers', async () => {
    const { result } = renderHook(() => useFileHandler());
    const mockFile = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });
    const mockEvent = { target: { files: [mockFile] } } as React.ChangeEvent<HTMLInputElement>;
    const mockParsedData = {
      data: [{ a: '1', b: '2' }],
      meta: { fields: ['a', 'b'] },
    };

    vi.spyOn(csvParser, 'parseCSV').mockResolvedValue(mockParsedData as any);

    await act(async () => {
      result.current.handleFileSelect(mockEvent);
    });

    expect(result.current.error).toBe('Missing required headers. Expected: begintrip_lat, begintrip_lng, dropoff_lat, dropoff_lng (case-insensitive).');
    expect(result.current.rows).toEqual([]);
  });

  it('should handle a parsing error', async () => {
    const { result } = renderHook(() => useFileHandler());
    const mockFile = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });
    const mockEvent = { target: { files: [mockFile] } } as React.ChangeEvent<HTMLInputElement>;

    vi.spyOn(csvParser, 'parseCSV').mockRejectedValue(new Error('Parsing failed'));

    await act(async () => {
      result.current.handleFileSelect(mockEvent);
    });

    expect(result.current.error).toBe('Unable to read this CSV. Please check formatting.');
    expect(result.current.rows).toEqual([]);
  });
});
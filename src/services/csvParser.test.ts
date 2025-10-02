import { describe, it, expect, vi } from 'vitest';
import { parseCSV } from './csvParser';
import Papa from 'papaparse';

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn(),
  },
}));

describe('parseCSV', () => {
  it('should parse a CSV file successfully', async () => {
    const mockFile = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });
    const mockResults = {
      data: [{ a: '1', b: '2' }],
      errors: [],
      meta: { fields: ['a', 'b'] },
    };

    (Papa.parse as vi.Mock).mockImplementation((file, config) => {
      config.complete(mockResults);
    });

    const result = await parseCSV(mockFile);
    expect(result).toEqual(mockResults);
  });

  it('should reject with an error if parsing fails', async () => {
    const mockFile = new File(['a,b\n1,2'], 'test.csv', { type: 'text/csv' });
    const mockError = new Error('Parsing failed');

    (Papa.parse as vi.Mock).mockImplementation((file, config) => {
      config.error(mockError);
    });

    await expect(parseCSV(mockFile)).rejects.toThrow('Parsing failed');
  });
});
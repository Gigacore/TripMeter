import '@testing-library/jest-dom';
import { vi } from 'vitest';

const ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserver);

class MockDataTransfer {
  files: File[] = [];
  items: { kind: string; type: string; getAsFile: () => File | null }[] = [];

  setData(format: string, data: string) {}

  getData(format: string) {
    return ''
  }

  clearData(format?: string) {}

  get types() {
    return ['Files'];
  }
}

// @ts-ignore
global.DataTransfer = MockDataTransfer;
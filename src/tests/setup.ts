import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

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

window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock('lucide-react', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    // Mock specific icons
    Award: (props) => React.createElement('div', props, 'Award'),
    // Add other icons that you use here
  };
});

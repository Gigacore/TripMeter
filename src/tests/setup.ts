import '@testing-library/jest-dom';

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
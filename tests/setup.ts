// Test setup file for Jest
import '@testing-library/jest-dom';

// Mock Electron APIs
Object.defineProperty(window, 'electron', {
  value: {
    saveCollections: jest.fn().mockResolvedValue(undefined),
    loadCollections: jest.fn().mockResolvedValue([]),
    saveHistory: jest.fn().mockResolvedValue(undefined),
    loadHistory: jest.fn().mockResolvedValue([]),
    saveEnvironments: jest.fn().mockResolvedValue(undefined),
    loadEnvironments: jest.fn().mockResolvedValue({ activeKey: undefined, items: [] })
  },
  writable: true
});

// Mock fetch for request testing
global.fetch = jest.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now())
  },
  writable: true
});

// Mock URL constructor
(global as any).URL = jest.fn().mockImplementation((url, base) => {
  const mockUrl = {
    searchParams: new Map(),
    toString: () => url
  };
  return mockUrl;
});

// Mock FormData
global.FormData = jest.fn().mockImplementation(() => ({
  append: jest.fn()
}));

// Mock URLSearchParams
global.URLSearchParams = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  toString: () => ''
}));

// Mock btoa
global.btoa = jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

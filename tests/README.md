# Testing Guide

This directory contains tests for the Rock API Client Electron application.

## Test Structure

- `setup.ts` - Jest setup file with mocks and global configurations
- `utils/` - Tests for utility functions
- `components/` - Tests for React components
- `main.test.js` - Tests for the Electron main process

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Categories

### 1. Utility Tests
- **requestSender.test.ts** - Tests for HTTP request sending functionality
- **codeGenerator.test.ts** - Tests for code generation (cURL, fetch, axios, HTTPie)

### 2. Component Tests
- **App.test.tsx** - Tests for the main App component
- **RequestTabs.test.tsx** - Tests for the request tabs component

### 3. Main Process Tests
- **main.test.js** - Tests for Electron main process functionality (IPC handlers, file operations)

### 4. Type Tests
- **types.test.ts** - Tests to ensure TypeScript type definitions work correctly

## Test Configuration

The tests use Jest with the following configuration:
- TypeScript support via `ts-jest`
- React testing via `@testing-library/react`
- JSDOM environment for DOM testing
- Mocked Electron APIs for main process testing

## Mocking Strategy

- **Electron APIs** - Mocked in `setup.ts` to avoid requiring Electron in test environment
- **Ant Design Components** - Mocked to simplify component testing
- **File System** - Mocked for main process tests
- **Fetch API** - Mocked for request testing

## Writing New Tests

When adding new tests:

1. Follow the existing naming convention: `*.test.ts` or `*.test.tsx`
2. Place tests in the appropriate directory based on what you're testing
3. Use descriptive test names that explain the expected behavior
4. Mock external dependencies appropriately
5. Test both success and error cases

## Example Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation
  });

  it('should handle error cases', () => {
    // Test implementation
  });
});
```

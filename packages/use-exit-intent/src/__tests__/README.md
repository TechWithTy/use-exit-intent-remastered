# useExitIntent Test Suite

This directory contains comprehensive tests for the `use-exit-intent` React hook, covering all bug fixes and new features.

## Test Structure

```
src/__tests__/
├── setup.ts                          # Jest setup and global mocks
├── useExitIntent.beforeunload.test.ts # Tests for beforeunload event fix
├── useExitIntent.cookiesync.test.ts   # Tests for cookie synchronization fix
├── mobileDetection.test.ts           # Tests for new mobile detection strategies
└── useExitIntent.integration.test.ts  # Integration tests for complete functionality
```

## Test Categories

### 1. Bug Fix Tests

#### BeforeUnload Event Handler Fix
- ✅ Tests `event.preventDefault()` is called correctly
- ✅ Tests cleanup on unmount
- ✅ Tests integration with unsubscribe state

#### Cookie Synchronization Fix
- ✅ Tests real-time cookie state reading
- ✅ Tests `unsubscribe()` functionality with cookie sync
- ✅ Tests `resetState()` functionality
- ✅ Tests multiple hook instances synchronization
- ✅ Tests custom cookie key handling

### 2. New Feature Tests

#### Mobile Detection Strategies
- ✅ **Scroll Detection**: Tests scroll threshold + quick scroll-up logic
- ✅ **Edge Swipe Detection**: Tests touch gesture edge detection
- ✅ **Back Button Detection**: Tests History API back button tracking
- ✅ **Activity Detection**: Tests inactivity timeout functionality

#### Enhanced TypeScript Interfaces
- ✅ Tests all new mobile options are properly typed
- ✅ Tests backward compatibility

### 3. Integration Tests
- ✅ Tests complete hook functionality end-to-end
- ✅ Tests settings updates and handler registration
- ✅ Tests edge cases and error conditions
- ✅ Tests backward compatibility

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Setup

The test suite uses:
- **Jest** as the test runner
- **React Testing Library** for React component testing
- **jsdom** environment for DOM simulation
- **TypeScript** for type safety

### Global Mocks

- `js-cookie`: Mocked for cookie state management
- `window` and `document` events: Mocked for event handling
- Utility functions: Mocked to isolate hook logic

## Test Coverage

The tests cover:
- ✅ All bug fixes (beforeunload, cookie sync)
- ✅ All new mobile detection strategies
- ✅ Enhanced TypeScript interfaces
- ✅ Hook integration and edge cases
- ✅ Backward compatibility
- ✅ Error handling

## Key Testing Patterns

1. **Event Simulation**: Tests simulate real browser events (scroll, touch, popstate)
2. **State Synchronization**: Tests verify cookie state is properly synchronized across instances
3. **Cleanup Verification**: Tests ensure event listeners are properly removed
4. **Edge Case Handling**: Tests cover error conditions and unusual scenarios

## Example Test Usage

```typescript
import { renderHook, act } from '@testing-library/react-hooks'
import { useExitIntent } from '../index'

describe('useExitIntent', () => {
  it('should handle mobile scroll detection', () => {
    const { result } = renderHook(() =>
      useExitIntent({
        mobile: {
          triggerOnScrollUp: true,
          scrollThreshold: 0.8,
        },
      })
    )

    // Test scroll logic
    expect(result.current.settings.mobile.triggerOnScrollUp).toBe(true)
  })
})
```

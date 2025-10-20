import '@testing-library/jest-dom'

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

// Ensure onbeforeunload is writable for tests
Object.defineProperty(window, 'onbeforeunload', {
  writable: true,
  value: null,
})

import { act } from '@testing-library/react'
import { renderHook } from './renderHook'
import { useExitIntent } from '../index'
import Cookies from 'js-cookie'

// Mock the utils
jest.mock('../utils', () => ({
  contexts: {
    onMobile: 'onMobile',
    onDesktop: 'onDesktop',
    onTrigger: 'onTrigger',
    onUnsubscribe: 'onUnsubscribe',
  },
  isMobile: jest.fn(() => false),
  isDesktop: jest.fn(() => true),
  createDebounce: jest.fn((callback) => ({
    execute: callback,
    abort: jest.fn(),
  })),
  defaultSettings: {
    cookie: { key: 'exit-intent', daysToExpire: 30 },
    desktop: {
      triggerOnIdle: false,
      triggerOnMouseLeave: true,
      delayInSecondsToTrigger: 10,
      mouseLeaveDelayInSeconds: 5,
      useBeforeUnload: false,
    },
    mobile: {
      triggerOnIdle: true,
      delayInSecondsToTrigger: 10,
      triggerOnScrollUp: false,
      scrollThreshold: 0.8,
      scrollUpThreshold: 0.3,
      triggerOnEdgeSwipe: false,
      edgeSwipeThreshold: 50,
      triggerOnBackButton: false,
      triggerOnInactivity: false,
      inactivityThreshold: 30,
    },
  },
  createIdleEvents: jest.fn(),
  removeIdleEvents: jest.fn(),
  secondsToMiliseconds: jest.fn((seconds) => seconds * 1000),
  processHandlersByDeviceContext: jest.fn(),
  createScrollDetection: jest.fn(() => ({ removeScrollDetection: jest.fn() })),
  createEdgeSwipeDetection: jest.fn(() => ({
    removeEdgeSwipeDetection: jest.fn(),
  })),
  createBackButtonDetection: jest.fn(() => ({
    removeBackButtonDetection: jest.fn(),
  })),
  createActivityDetection: jest.fn(() => ({
    removeActivityDetection: jest.fn(),
    pauseActivityDetection: jest.fn(),
    resumeActivityDetection: jest.fn(),
  })),
}))

describe('useExitIntent - Cookie Synchronization Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Cookies.get as jest.Mock).mockReturnValue(null)
    ;(Cookies.set as jest.Mock).mockImplementation(() => {})
    ;(Cookies.remove as jest.Mock).mockImplementation(() => {})
  })

  it('should read cookie state in real-time for shouldNotTrigger check', () => {
    // Initially no cookie set
    ;(Cookies.get as jest.Mock).mockReturnValue(null)

    const { result } = renderHook(() => useExitIntent())

    // Initially should not be unsubscribed
    expect(result.current.isUnsubscribed).toBe(false)
    expect(result.current.willBeTriggered).toBe(true)

    // Simulate external cookie modification
    ;(Cookies.get as jest.Mock).mockReturnValue('true')

    // Create a new hook instance to test real-time reading
    const secondHook = renderHook(() => useExitIntent())
    const { result: result2 } = secondHook

    // Should immediately reflect the new cookie state
    expect(result2.current.isUnsubscribed).toBe(true)
    expect(result2.current.willBeTriggered).toBe(false)
  })

  it('should handle unsubscribe correctly with real-time cookie reading', () => {
    const cookieGetMock = Cookies.get as jest.Mock
    cookieGetMock.mockReturnValue(null)

    const { result } = renderHook(() => useExitIntent())

    expect(result.current.isUnsubscribed).toBe(false)

    // Call unsubscribe
    act(() => {
      cookieGetMock.mockImplementation(() => 'true')
      result.current.unsubscribe()
    })

    // Cookie should be set
    expect(Cookies.set).toHaveBeenCalledWith(
      'exit-intent',
      'true',
      expect.objectContaining({
        expires: 30,
        sameSite: 'Strict',
      })
    )

    // State should be updated
    expect(result.current.isUnsubscribed).toBe(true)
    expect(result.current.willBeTriggered).toBe(false)
  })

  it('should handle resetState correctly with real-time cookie reading', () => {
    const cookieGetMock = Cookies.get as jest.Mock
    // Start with cookie set (unsubscribed state)
    cookieGetMock.mockReturnValue('true')

    const { result } = renderHook(() => useExitIntent())

    expect(result.current.isUnsubscribed).toBe(true)

    // Call resetState
    act(() => {
      cookieGetMock.mockImplementation(() => null)
      result.current.resetState()
    })

    // Cookie should be removed
    expect(Cookies.remove).toHaveBeenCalledWith('exit-intent', {
      sameSite: 'Strict',
    })

    // State should be reset
    expect(result.current.isUnsubscribed).toBe(false)
    expect(result.current.willBeTriggered).toBe(true)
  })

  it('should handle multiple hook instances with synchronized cookie state', () => {
    const cookieGetMock = Cookies.get as jest.Mock
    cookieGetMock.mockReturnValue(null)

    // Create first hook instance
    const { result: result1 } = renderHook(() => useExitIntent())

    expect(result1.current.isUnsubscribed).toBe(false)

    // Create second hook instance
    const secondHook = renderHook(() => useExitIntent())
    const { result: result2 } = secondHook

    expect(result2.current.isUnsubscribed).toBe(false)

    // Unsubscribe from first instance
    act(() => {
      cookieGetMock.mockImplementation(() => 'true')
      result1.current.unsubscribe()
      secondHook.rerender()
    })

    // Both instances should reflect the unsubscribed state
    expect(result1.current.isUnsubscribed).toBe(true)
    expect(result2.current.isUnsubscribed).toBe(true)
    expect(result1.current.willBeTriggered).toBe(false)
    expect(result2.current.willBeTriggered).toBe(false)
  })

  it('should handle cookie key changes correctly', () => {
    const customCookieKey = 'custom-exit-intent'

    ;(Cookies.get as jest.Mock).mockImplementation((key) => {
      if (key === customCookieKey) return 'true'
      return null
    })

    const { result } = renderHook(() =>
      useExitIntent({
        cookie: {
          key: customCookieKey,
        },
      })
    )

    // Should read from the custom cookie key
    expect(result.current.isUnsubscribed).toBe(true)
    expect(result.current.willBeTriggered).toBe(false)
  })
})

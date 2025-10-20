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

describe('useExitIntent - BeforeUnload Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window.onbeforeunload
    window.onbeforeunload = null
  })

  it('should call event.preventDefault() when useBeforeUnload is enabled', () => {
    const mockPreventDefault = jest.fn()
    const mockHandler = jest.fn()

    renderHook(() =>
      useExitIntent({
        desktop: {
          useBeforeUnload: true,
        },
      })
    )

    // Simulate beforeunload event
    const beforeunloadEvent = {
      preventDefault: mockPreventDefault,
    } as unknown as BeforeUnloadEvent

    // Access the handler that was set
    if (window.onbeforeunload) {
      act(() => {
        window.onbeforeunload?.(beforeunloadEvent)
      })
    }

    expect(mockPreventDefault).toHaveBeenCalled()
  })

  it('should not call event.preventDefault() when useBeforeUnload is disabled', () => {
    const mockPreventDefault = jest.fn()

    renderHook(() =>
      useExitIntent({
        desktop: {
          useBeforeUnload: false,
        },
      })
    )

    // Window.onbeforeunload should be null when disabled
    expect(window.onbeforeunload).toBeNull()
  })

  it('should handle beforeunload event correctly with unsubscribe state', () => {
    const mockPreventDefault = jest.fn()
    const mockHandler = jest.fn()

    // Set cookie to simulate unsubscribed state
    ;(Cookies.set as jest.Mock).mockImplementation(() => {})

    const { result } = renderHook(() =>
      useExitIntent({
        desktop: {
          useBeforeUnload: true,
        },
      })
    )

    // Call unsubscribe
    act(() => {
      result.current.unsubscribe()
    })

    // Simulate beforeunload event after unsubscribe
    const beforeunloadEvent = {
      preventDefault: mockPreventDefault,
    } as unknown as BeforeUnloadEvent

    if (window.onbeforeunload) {
      act(() => {
        window.onbeforeunload?.(beforeunloadEvent)
      })
    }

    // Should still call preventDefault even after unsubscribe
    expect(mockPreventDefault).toHaveBeenCalled()
  })

  it('should properly cleanup beforeunload handler on unmount', () => {
    const { unmount } = renderHook(() =>
      useExitIntent({
        desktop: {
          useBeforeUnload: true,
        },
      })
    )

    act(() => {
      unmount()
    })

    // Should cleanup the handler
    expect(window.onbeforeunload).toBeNull()
  })
})

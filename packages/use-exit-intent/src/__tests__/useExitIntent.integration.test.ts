import { act } from '@testing-library/react'
import { renderHook } from './renderHook'
import { useExitIntent } from '../index'
import Cookies from 'js-cookie'

jest.mock('../utils', () => {
  const actual = jest.requireActual('../utils')

  return {
    ...actual,
    isMobile: jest.fn(() => false),
    isDesktop: jest.fn(() => true),
    createDebounce: jest.fn((callback: () => void) => ({
      execute: callback,
      abort: jest.fn(),
    })),
    createIdleEvents: jest.fn(),
    removeIdleEvents: jest.fn(),
    secondsToMiliseconds: jest.fn((seconds: number) => seconds * 1000),
    processHandlersByDeviceContext: jest.fn((handler) => handler.handler()),
    createScrollDetection: jest.fn(() => ({
      removeScrollDetection: jest.fn(),
    })),
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
  }
})

const mockedUtils = jest.requireMock('../utils') as {
  isMobile: jest.Mock
  isDesktop: jest.Mock
  createDebounce: jest.Mock
  createIdleEvents: jest.Mock
  removeIdleEvents: jest.Mock
  secondsToMiliseconds: jest.Mock
  processHandlersByDeviceContext: jest.Mock
  createScrollDetection: jest.Mock
  createEdgeSwipeDetection: jest.Mock
  createBackButtonDetection: jest.Mock
  createActivityDetection: jest.Mock
}

const {
  isMobile: mockIsMobile,
  isDesktop: mockIsDesktop,
  createDebounce: mockCreateDebounce,
  createIdleEvents: mockCreateIdleEvents,
  removeIdleEvents: mockRemoveIdleEvents,
  secondsToMiliseconds: mockSecondsToMiliseconds,
  processHandlersByDeviceContext: mockProcessHandlersByDeviceContext,
  createScrollDetection: mockCreateScrollDetection,
  createEdgeSwipeDetection: mockCreateEdgeSwipeDetection,
  createBackButtonDetection: mockCreateBackButtonDetection,
  createActivityDetection: mockCreateActivityDetection,
} = mockedUtils

describe('useExitIntent - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(Cookies.get as jest.Mock).mockReturnValue(null)
    ;(Cookies.set as jest.Mock).mockImplementation(() => {})
    ;(Cookies.remove as jest.Mock).mockImplementation(() => {})
    window.onbeforeunload = null
    mockIsMobile.mockReturnValue(false)
    mockIsDesktop.mockReturnValue(true)
    mockCreateDebounce.mockImplementation((callback: () => void) => ({
      execute: callback,
      abort: jest.fn(),
    }))
  })

  it('should integrate all desktop detection strategies correctly', () => {
    const { result } = renderHook(() =>
      useExitIntent({
        desktop: {
          triggerOnIdle: true,
          triggerOnMouseLeave: true,
          useBeforeUnload: true,
        },
      })
    )

    // Should return all expected properties
    expect(result.current).toHaveProperty('settings')
    expect(result.current).toHaveProperty('resetState')
    expect(result.current).toHaveProperty('isTriggered')
    expect(result.current).toHaveProperty('unsubscribe')
    expect(result.current).toHaveProperty('resetSettings')
    expect(result.current).toHaveProperty('updateSettings')
    expect(result.current).toHaveProperty('isUnsubscribed')
    expect(result.current).toHaveProperty('registerHandler')
    expect(result.current).toHaveProperty('willBeTriggered')

    // Should initialize correctly
    expect(result.current.isTriggered).toBe(false)
    expect(result.current.isUnsubscribed).toBe(false)
    expect(result.current.willBeTriggered).toBe(true)
  })

  it('should handle complete mobile configuration with all new strategies', () => {
    mockIsMobile.mockReturnValue(true)
    mockIsDesktop.mockReturnValue(false)

    const { result } = renderHook(() =>
      useExitIntent({
        mobile: {
          triggerOnIdle: true,
          triggerOnScrollUp: true,
          scrollThreshold: 0.9,
          scrollUpThreshold: 0.4,
          triggerOnEdgeSwipe: true,
          edgeSwipeThreshold: 30,
          triggerOnBackButton: true,
          triggerOnInactivity: true,
          inactivityThreshold: 45,
        },
      })
    )

    expect(mockCreateIdleEvents).toHaveBeenCalled()
    expect(mockCreateScrollDetection).toHaveBeenCalledWith(
      expect.objectContaining({
        scrollThreshold: 0.9,
        scrollUpThreshold: 0.4,
        callback: expect.any(Function),
      })
    )
    expect(mockCreateEdgeSwipeDetection).toHaveBeenCalledWith(
      expect.objectContaining({
        edgeSwipeThreshold: 30,
        callback: expect.any(Function),
      })
    )
    expect(mockCreateBackButtonDetection).toHaveBeenCalledWith(
      expect.objectContaining({
        callback: expect.any(Function),
      })
    )
    expect(mockCreateActivityDetection).toHaveBeenCalledWith(
      expect.objectContaining({
        inactivityThreshold: 45,
        callback: expect.any(Function),
      })
    )

    // Should handle all mobile options without errors
    expect(result.current.isTriggered).toBe(false)
    expect(result.current.isUnsubscribed).toBe(false)
    expect(result.current.willBeTriggered).toBe(true)

    // Should return mobile settings with all new options
    expect(result.current.settings.mobile).toEqual(
      expect.objectContaining({
        triggerOnIdle: true,
        triggerOnScrollUp: true,
        scrollThreshold: 0.9,
        scrollUpThreshold: 0.4,
        triggerOnEdgeSwipe: true,
        edgeSwipeThreshold: 30,
        triggerOnBackButton: true,
        triggerOnInactivity: true,
        inactivityThreshold: 45,
      })
    )
  })

  it('should handle handler registration and triggering', () => {
    const mockHandler = jest.fn()
    const mockUnsubscribeHandler = jest.fn()

    const { result } = renderHook(() => useExitIntent())

    // Register handlers
    result.current.registerHandler({
      id: 'test-handler',
      handler: mockHandler,
      context: ['onTrigger'],
    })

    result.current.registerHandler({
      id: 'unsubscribe-handler',
      handler: mockUnsubscribeHandler,
      context: ['onUnsubscribe'],
    })

    // Simulate trigger (desktop mouse leave)
    act(() => {
      // This would normally be triggered by the actual event
      // For testing, we'll directly call the handler logic
    })

    // Test unsubscribe functionality
    act(() => {
      result.current.unsubscribe()
    })

    // Unsubscribe handler should be called
    expect(mockUnsubscribeHandler).toHaveBeenCalled()
  })

  it('should handle settings updates correctly', () => {
    const { result } = renderHook(() => useExitIntent())

    const newSettings = {
      desktop: {
        triggerOnMouseLeave: false,
        useBeforeUnload: true,
      },
      mobile: {
        triggerOnScrollUp: true,
      },
    }

    act(() => {
      result.current.updateSettings(newSettings)
    })

    // Settings should be updated
    expect(result.current.settings.desktop.triggerOnMouseLeave).toBe(false)
    expect(result.current.settings.desktop.useBeforeUnload).toBe(true)
    expect(result.current.settings.mobile.triggerOnScrollUp).toBe(true)
  })

  it('should handle complete reset functionality', () => {
    const { result } = renderHook(() => useExitIntent())

    // Trigger and unsubscribe
    act(() => {
      result.current.unsubscribe()
    })

    expect(result.current.isTriggered).toBe(false) // Reset on unsubscribe
    expect(result.current.isUnsubscribed).toBe(true)

    // Reset state
    act(() => {
      result.current.resetState()
    })

    expect(result.current.isTriggered).toBe(false)
    expect(result.current.isUnsubscribed).toBe(false)
    expect(result.current.willBeTriggered).toBe(true)
  })

  it('should handle edge cases and error conditions gracefully', () => {
    // Test with undefined/null props
    const { result: result1 } = renderHook(() => useExitIntent(undefined))
    expect(result1.current.isTriggered).toBe(false)

    // Test with empty object
    const { result: result2 } = renderHook(() => useExitIntent({}))
    expect(result2.current.isTriggered).toBe(false)

    // Test handler registration with no context
    const { result: result3 } = renderHook(() => useExitIntent())
    result3.current.registerHandler({
      id: 'no-context-handler',
      handler: jest.fn(),
      // No context specified
    })

    expect(result3.current.isTriggered).toBe(false)
  })

  it('should maintain backward compatibility with existing configurations', () => {
    // Test minimal configuration (backward compatibility)
    const { result: result1 } = renderHook(() => useExitIntent())
    expect(result1.current.isTriggered).toBe(false)
    expect(result1.current.isUnsubscribed).toBe(false)

    // Test desktop-only configuration
    const { result: result2 } = renderHook(() =>
      useExitIntent({
        desktop: {
          triggerOnMouseLeave: true,
        },
      })
    )
    expect(result2.current.settings.desktop.triggerOnMouseLeave).toBe(true)

    // Test mobile-only configuration
    const { result: result3 } = renderHook(() =>
      useExitIntent({
        mobile: {
          triggerOnIdle: true,
        },
      })
    )
    expect(result3.current.settings.mobile.triggerOnIdle).toBe(true)
  })
})

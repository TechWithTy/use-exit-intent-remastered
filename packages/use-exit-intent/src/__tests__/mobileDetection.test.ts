import {
  createScrollDetection,
  createEdgeSwipeDetection,
  createBackButtonDetection,
  createActivityDetection,
} from '../utils/factories'

// Mock DOM elements and events
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
})

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
})

Object.defineProperty(window, 'pageYOffset', {
  writable: true,
  value: 0,
})

Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    scrollHeight: 1000,
    clientHeight: 800,
  },
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 800,
})

describe('Mobile Detection Strategies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.pageYOffset = 0
  })

  afterEach(() => {
    Object.defineProperty(window, 'addEventListener', {
      writable: true,
      value: mockAddEventListener,
    })

    Object.defineProperty(window, 'removeEventListener', {
      writable: true,
      value: mockRemoveEventListener,
    })
  })

  describe('createScrollDetection', () => {
    it('should trigger callback when user scrolls past threshold then back up', () => {
      const mockCallback = jest.fn()
      const { removeScrollDetection } = createScrollDetection({
        scrollThreshold: 0.8, // 80% of page
        scrollUpThreshold: 0.3, // 30% scroll up
        callback: mockCallback,
      })

      const [, handleScroll] = mockAddEventListener.mock.calls.find(
        ([event]) => event === 'scroll'
      ) as [string, () => void]

      // Simulate scrolling past threshold (80% of 1000px = 800px)
      window.pageYOffset = 800
      handleScroll()

      // Should start tracking
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        true
      )

      // Simulate scrolling back up significantly (30% of 1000px = 300px)
      window.pageYOffset = 500
      handleScroll()

      // Should trigger callback
      expect(mockCallback).toHaveBeenCalled()

      // Cleanup
      removeScrollDetection()
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        true
      )
    })

    it('should not trigger if scroll up is not significant enough', () => {
      const mockCallback = jest.fn()
      const { removeScrollDetection } = createScrollDetection({
        scrollThreshold: 0.8,
        scrollUpThreshold: 0.3,
        callback: mockCallback,
      })

      const [, handleScroll] = mockAddEventListener.mock.calls.find(
        ([event]) => event === 'scroll'
      ) as [string, () => void]

      // Scroll past threshold
      window.pageYOffset = 800
      handleScroll()

      // Scroll back up but not enough (less than 30% threshold)
      window.pageYOffset = 750
      handleScroll()

      // Should not trigger
      expect(mockCallback).not.toHaveBeenCalled()

      removeScrollDetection()
    })

    it('should guard against pages without scrollable content', () => {
      const mockCallback = jest.fn()

      const originalDocumentElement = document.documentElement
      Object.defineProperty(document, 'documentElement', {
        writable: true,
        value: {
          scrollHeight: 800,
          clientHeight: 800,
          scrollTop: 0,
        },
      })

      const { removeScrollDetection } = createScrollDetection({
        scrollThreshold: 0.8,
        scrollUpThreshold: 0.3,
        callback: mockCallback,
      })

      const [, handleScroll] = mockAddEventListener.mock.calls.find(
        ([event]) => event === 'scroll'
      ) as [string, () => void]

      window.pageYOffset = 100
      handleScroll()

      expect(mockCallback).not.toHaveBeenCalled()

      removeScrollDetection()

      Object.defineProperty(document, 'documentElement', {
        writable: true,
        value: originalDocumentElement,
      })
    })
  })

  describe('createEdgeSwipeDetection', () => {
    it('should trigger callback on edge swipe gesture', () => {
      const mockCallback = jest.fn()

      // Mock touch events
      const mockTouchStart = jest.fn()
      const mockTouchMove = jest.fn()

      window.addEventListener = jest.fn((event, handler) => {
        if (event === 'touchstart') mockTouchStart.mockImplementation(handler)
        if (event === 'touchmove') mockTouchMove.mockImplementation(handler)
      })

      const { removeEdgeSwipeDetection } = createEdgeSwipeDetection({
        edgeSwipeThreshold: 50,
        callback: mockCallback,
      })

      // Simulate touch start near left edge
      const touchStartEvent = {
        touches: [{ clientX: 25, clientY: 100 }], // Within 50px of left edge
      } as any

      mockTouchStart(touchStartEvent)

      // Simulate touch move (swipe right)
      const touchMoveEvent = {
        touches: [{ clientX: 100, clientY: 100 }], // Moved right
      } as any

      mockTouchMove(touchMoveEvent)

      // Should trigger callback for edge swipe
      expect(mockCallback).toHaveBeenCalled()

      removeEdgeSwipeDetection()
    })

    it('should not trigger for non-edge touches', () => {
      const mockCallback = jest.fn()

      const mockTouchStart = jest.fn()
      window.addEventListener = jest.fn((event, handler) => {
        if (event === 'touchstart') mockTouchStart.mockImplementation(handler)
      })

      createEdgeSwipeDetection({
        edgeSwipeThreshold: 50,
        callback: mockCallback,
      })

      // Touch in middle of screen (not near edge)
      const touchStartEvent = {
        touches: [{ clientX: 200, clientY: 100 }], // Middle of 800px screen
      } as any

      mockTouchStart(touchStartEvent)

      // Should not trigger tracking for non-edge touches
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('createBackButtonDetection', () => {
    it('should detect back button press using History API', () => {
      const mockCallback = jest.fn()

      // Mock history API
      const mockPushState = jest.fn(function (state) {
        ;(this as any).state = state
      })
      const mockReplaceState = jest.fn(function (state) {
        ;(this as any).state = state
      })
      const mockBack = jest.fn()

      Object.defineProperty(window, 'history', {
        writable: true,
        value: {
          pushState: mockPushState,
          replaceState: mockReplaceState,
          back: mockBack,
          state: null,
        },
      })

      const { removeBackButtonDetection } = createBackButtonDetection({
        callback: mockCallback,
      })

      const [, handlePopState] = mockAddEventListener.mock.calls.find(
        ([event]) => event === 'popstate'
      ) as [string, (event: PopStateEvent) => void]

      // Should push sentinel state to history
      expect(mockPushState).toHaveBeenCalledWith(
        expect.objectContaining({ __exitIntentBackSentinel: true }),
        '',
        window.location.href
      )

      // Simulate popstate event (back button)
      const popStateEvent = new PopStateEvent('popstate', {
        state: { __exitIntentBackSentinel: true },
      })

      handlePopState(popStateEvent)

      // Should trigger callback and re-arm sentinel
      expect(mockCallback).toHaveBeenCalled()
      expect(mockPushState).toHaveBeenCalledTimes(2)

      removeBackButtonDetection()

      expect(mockReplaceState).toHaveBeenCalledWith(
        null,
        '',
        window.location.href
      )
      expect(mockBack).not.toHaveBeenCalled()
    })
  })

  describe('createActivityDetection', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should trigger callback after inactivity period', () => {
      const mockCallback = jest.fn()

      const { removeActivityDetection } = createActivityDetection({
        inactivityThreshold: 30, // 30 seconds
        callback: mockCallback,
      })

      // Should set up activity event listeners
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function),
        true
      )
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function),
        true
      )
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function),
        true
      )

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000)

      // Should trigger callback
      expect(mockCallback).toHaveBeenCalled()

      removeActivityDetection()
    })

    it('should reset timer on user activity', () => {
      const mockCallback = jest.fn()

      createActivityDetection({
        inactivityThreshold: 30,
        callback: mockCallback,
      })

      // Fast-forward 25 seconds (not enough to trigger)
      jest.advanceTimersByTime(25000)

      // Simulate user activity (mousemove)
      const [, activityHandler] = mockAddEventListener.mock.calls.find(
        ([event]) => event === 'mousemove'
      ) as [string, (event: Event) => void]

      activityHandler(new MouseEvent('mousemove'))

      // Fast-forward another 25 seconds (total 50 seconds from start)
      jest.advanceTimersByTime(25000)

      // Should not have triggered yet (timer was reset)
      expect(mockCallback).not.toHaveBeenCalled()

      // Fast-forward remaining 5 seconds to reach 30 seconds from last activity
      jest.advanceTimersByTime(5000)

      // Now should trigger
      expect(mockCallback).toHaveBeenCalled()
    })

    it('should provide pause and resume functionality', () => {
      const mockCallback = jest.fn()

      const {
        pauseActivityDetection,
        resumeActivityDetection,
        removeActivityDetection,
      } = createActivityDetection({
        inactivityThreshold: 30,
        callback: mockCallback,
      })

      // Fast-forward 25 seconds
      jest.advanceTimersByTime(25000)

      // Pause detection
      pauseActivityDetection()

      // Fast-forward another 10 seconds (total 35 seconds)
      jest.advanceTimersByTime(10000)

      // Should not trigger (paused)
      expect(mockCallback).not.toHaveBeenCalled()

      // Resume detection
      resumeActivityDetection()

      // Fast-forward 30 seconds from resume
      jest.advanceTimersByTime(30000)

      // Should trigger now
      expect(mockCallback).toHaveBeenCalled()

      removeActivityDetection()
    })
  })
})

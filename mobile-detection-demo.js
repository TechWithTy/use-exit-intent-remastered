/**
 * Test file demonstrating new mobile exit intent detection strategies
 * This shows how the enhanced useExitIntent hook would work with the new options
 */

import {
  createScrollDetection,
  createEdgeSwipeDetection,
  createBackButtonDetection,
  createActivityDetection
} from './packages/use-exit-intent/src/utils/factories'

// Example usage of new mobile detection strategies

// 1. Scroll threshold with quick scroll up detection
const scrollDetection = createScrollDetection({
  scrollThreshold: 0.8, // Trigger when user scrolls past 80% of page
  scrollUpThreshold: 0.3, // Trigger if they scroll up more than 30% of page height
  callback: () => {
    console.log('Exit intent detected: User scrolled down and back up quickly')
  }
})

// 2. Edge swipe detection for mobile
const edgeSwipeDetection = createEdgeSwipeDetection({
  edgeSwipeThreshold: 50, // Trigger when swiping from within 50px of screen edge
  callback: () => {
    console.log('Exit intent detected: Edge swipe gesture')
  }
})

// 3. Back button detection using History API
const backButtonDetection = createBackButtonDetection({
  callback: () => {
    console.log('Exit intent detected: Back button pressed')
  }
})

// 4. Activity-based detection (inactivity timeout)
const activityDetection = createActivityDetection({
  inactivityThreshold: 30, // Trigger after 30 seconds of inactivity
  callback: () => {
    console.log('Exit intent detected: User became inactive')
  }
})

// Example of how these would be used in the enhanced useExitIntent hook:
/*
useExitIntent({
  mobile: {
    triggerOnIdle: true,
    triggerOnScrollUp: true,
    scrollThreshold: 0.8,
    scrollUpThreshold: 0.3,
    triggerOnEdgeSwipe: true,
    edgeSwipeThreshold: 50,
    triggerOnBackButton: true,
    triggerOnInactivity: true,
    inactivityThreshold: 30
  }
})
*/

// Cleanup functions (normally handled by the hook)
setTimeout(() => {
  scrollDetection.removeScrollDetection()
  edgeSwipeDetection.removeEdgeSwipeDetection()
  backButtonDetection.removeBackButtonDetection()
  activityDetection.removeActivityDetection()
}, 10000)

console.log('✅ New mobile detection strategies are ready for integration!')

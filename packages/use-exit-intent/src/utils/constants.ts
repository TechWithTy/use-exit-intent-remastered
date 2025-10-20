import { Context, InternalExitIntentSettings } from '../types'

export const contexts: { [key in Exclude<Context, '' | void>]: Context } = {
  onMobile: 'onMobile',
  onTrigger: 'onTrigger',
  onDesktop: 'onDesktop',
  onUnsubscribe: 'onUnsubscribe',
}

export const defaultSettings: InternalExitIntentSettings = {
  cookie: {
    daysToExpire: 30,
    key: 'exit-intent',
  },
  desktop: {
    triggerOnIdle: false,
    useBeforeUnload: false,
    triggerOnMouseLeave: true,
    delayInSecondsToTrigger: 10,
    mouseLeaveDelayInSeconds: 5,
  },

  mobile: {
    triggerOnIdle: true,
    delayInSecondsToTrigger: 10,
    // New mobile detection strategy defaults
    triggerOnScrollUp: false,
    scrollThreshold: 0.8, // 80% of page height
    scrollUpThreshold: 0.3, // 30% scroll up distance
    triggerOnEdgeSwipe: false,
    edgeSwipeThreshold: 50, // pixels from edge
    triggerOnBackButton: false,
    triggerOnInactivity: false,
    inactivityThreshold: 30, // seconds of inactivity
  },
}

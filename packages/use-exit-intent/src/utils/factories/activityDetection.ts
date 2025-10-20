interface ActivityDetectionOptions {
  inactivityThreshold?: number
  callback: () => void
}

export function createActivityDetection(options: ActivityDetectionOptions) {
  const { inactivityThreshold = 30, callback } = options

  let lastActivityTime = Date.now()
  let inactivityTimer: number | null = null
  let isActive = true

  const resetInactivityTimer = () => {
    lastActivityTime = Date.now()

    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }

    if (isActive) {
      inactivityTimer = setTimeout(() => {
        callback()
      }, inactivityThreshold * 1000)
    }
  }

  const handleActivity = () => {
    resetInactivityTimer()
  }

  const pauseActivityDetection = () => {
    isActive = false
    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
      inactivityTimer = null
    }
  }

  const resumeActivityDetection = () => {
    isActive = true
    resetInactivityTimer()
  }

  // Track various user activity events
  const events = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'click',
    'focus',
  ] as const

  events.forEach((event) => {
    window.addEventListener(event, handleActivity, true)
  })

  // Start the inactivity timer
  resetInactivityTimer()

  const removeActivityDetection = () => {
    events.forEach((event) => {
      window.removeEventListener(event, handleActivity, true)
    })

    if (inactivityTimer) {
      clearTimeout(inactivityTimer)
    }
  }

  return {
    removeActivityDetection,
    pauseActivityDetection,
    resumeActivityDetection,
  }
}

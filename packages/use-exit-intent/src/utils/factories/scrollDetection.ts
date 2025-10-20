interface ScrollDetectionOptions {
  scrollThreshold?: number
  scrollUpThreshold?: number
  callback: () => void
}

const noop = () => {}

export function createScrollDetection(options: ScrollDetectionOptions) {
  if (typeof window === 'undefined' || !document?.documentElement) {
    return { removeScrollDetection: noop }
  }

  const { scrollThreshold = 0.8, scrollUpThreshold = 0.3, callback } = options

  let lastScrollTop = 0
  let isTracking = false

  const handleScroll = () => {
    const documentElement = document.documentElement
    if (!documentElement) return

    const scrollTop = window.pageYOffset || documentElement.scrollTop
    const scrollableHeight = documentElement.scrollHeight - window.innerHeight

    if (scrollableHeight <= 0) {
      return
    }

    const scrollPercentage = scrollTop / scrollableHeight

    // Check if user has scrolled past threshold
    if (scrollPercentage >= scrollThreshold && !isTracking) {
      isTracking = true
      lastScrollTop = scrollTop
    }

    // If tracking and user scrolls up significantly, trigger exit intent
    if (isTracking && scrollTop < lastScrollTop) {
      const scrollUpDistance = lastScrollTop - scrollTop
      const scrollUpPercentage = scrollUpDistance / scrollableHeight

      if (scrollUpPercentage >= scrollUpThreshold) {
        callback()
        removeScrollDetection()
      }
    }

    if (scrollTop > lastScrollTop) {
      lastScrollTop = scrollTop
    }
  }

  const removeScrollDetection = () => {
    window.removeEventListener('scroll', handleScroll, true)
    isTracking = false
  }

  window.addEventListener('scroll', handleScroll, true)

  return { removeScrollDetection }
}

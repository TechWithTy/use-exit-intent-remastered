interface EdgeSwipeOptions {
  edgeSwipeThreshold?: number
  callback: () => void
}

export function createEdgeSwipeDetection(options: EdgeSwipeOptions) {
  const { edgeSwipeThreshold = 50, callback } = options

  let startX = 0
  let startY = 0
  let isTracking = false

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    startX = touch.clientX
    startY = touch.clientY

    // Check if touch started near the edge (left or right side)
    const isNearLeftEdge = startX <= edgeSwipeThreshold
    const isNearRightEdge = startX >= window.innerWidth - edgeSwipeThreshold

    if (isNearLeftEdge || isNearRightEdge) {
      isTracking = true
    }
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (!isTracking) return

    const touch = event.touches[0]
    const currentX = touch.clientX
    const currentY = touch.clientY

    // Calculate swipe distance and direction
    const deltaX = currentX - startX
    const deltaY = Math.abs(currentY - startY)

    // Check for horizontal swipe (more horizontal than vertical movement)
    if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 30) {
      // Trigger if swiping inward from edge
      const isFromLeftEdge = startX <= edgeSwipeThreshold && deltaX > 0
      const isFromRightEdge =
        startX >= window.innerWidth - edgeSwipeThreshold && deltaX < 0

      if (isFromLeftEdge || isFromRightEdge) {
        callback()
        removeEdgeSwipeDetection()
      }
    }
  }

  const handleTouchEnd = () => {
    isTracking = false
  }

  const removeEdgeSwipeDetection = () => {
    window.removeEventListener('touchstart', handleTouchStart, true)
    window.removeEventListener('touchmove', handleTouchMove, true)
    window.removeEventListener('touchend', handleTouchEnd, true)
    isTracking = false
  }

  window.addEventListener('touchstart', handleTouchStart, true)
  window.addEventListener('touchmove', handleTouchMove, true)
  window.addEventListener('touchend', handleTouchEnd, true)

  return { removeEdgeSwipeDetection }
}

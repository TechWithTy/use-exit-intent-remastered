interface BackButtonOptions {
  callback: () => void
}

const noop = () => {}

export function createBackButtonDetection(options: BackButtonOptions) {
  if (typeof window === 'undefined') {
    return { removeBackButtonDetection: noop }
  }

  const { history, location } = window

  if (!history?.pushState || !history.replaceState) {
    return { removeBackButtonDetection: noop }
  }

  const { callback } = options
  const originalState = history.state
  const sentinelState = {
    ...(typeof originalState === 'object' && originalState !== null
      ? originalState
      : {}),
    __exitIntentBackSentinel: true,
  }

  const handlePopState = (event: PopStateEvent) => {
    if (!event.state?.__exitIntentBackSentinel) {
      return
    }

    callback()

    // Re-arm the sentinel so subsequent back presses are still captured.
    history.pushState(sentinelState, '', location.href)
  }

  try {
    history.pushState(sentinelState, '', location.href)
  } catch (error) {
    return { removeBackButtonDetection: noop }
  }

  window.addEventListener('popstate', handlePopState)

  const removeBackButtonDetection = () => {
    window.removeEventListener('popstate', handlePopState)

    if (history.state?.__exitIntentBackSentinel) {
      history.replaceState(originalState ?? null, '', location.href)
    }
  }

  return { removeBackButtonDetection }
}

import { useEffect, useState, useCallback, useRef } from 'react'
import Cookies from 'js-cookie'

export * from './types'

import {
  contexts,
  isMobile,
  isDesktop,
  createDebounce,
  defaultSettings,
  createIdleEvents,
  removeIdleEvents,
  secondsToMiliseconds,
  processHandlersByDeviceContext,
  createScrollDetection,
  createEdgeSwipeDetection,
  createBackButtonDetection,
  createActivityDetection,
} from './utils'

import {
  ExitIntentHandler,
  ExitIntentSettings,
  InternalExitIntentSettings,
} from './types'

export function useExitIntent(props: ExitIntentSettings | void = {}) {
  const safeProps = props ?? {}

  const initialSettings: InternalExitIntentSettings = {
    ...defaultSettings,

    cookie: {
      ...defaultSettings.cookie,
      ...safeProps.cookie,
    },

    desktop: {
      ...defaultSettings.desktop,
      ...safeProps.desktop,
    },

    mobile: {
      ...defaultSettings.mobile,
      ...safeProps.mobile,
    },
  }

  const [settings, setSettings] =
    useState<InternalExitIntentSettings>(initialSettings)

  const [isTriggered, setIsTriggered] = useState(false)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)

  const handlers = useRef<ExitIntentHandler[]>([]).current
  const shouldNotTrigger = useRef<boolean>(false)

  const { mobile, desktop, cookie } = settings

  // Helper function to read current cookie state in real-time
  const readIsUnsubscribed = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return Cookies.get(cookie.key) === 'true'
  }, [cookie.key])

  const isCookieUnsubscribed = readIsUnsubscribed()

  const willBeTriggered = !isCookieUnsubscribed && !isTriggered

  shouldNotTrigger.current = isCookieUnsubscribed || isTriggered

  const handleExitIntent = useCallback(() => {
    if (shouldNotTrigger.current) return

    setIsTriggered(true)

    handlers
      .filter((handler) => {
        const isDefault =
          handler.context?.filter(
            (context) =>
              context !== contexts.onDesktop && context !== contexts.onMobile
          ).length === 0

        return isDefault || handler.context?.includes(contexts.onTrigger)
      })
      .forEach(processHandlersByDeviceContext)
  }, [handlers, processHandlersByDeviceContext])

  const unsubscribe = useCallback(() => {
    Cookies.set(cookie.key, 'true', {
      expires: cookie.daysToExpire,
      sameSite: 'Strict',
    })

    handlers
      .filter((handler) => handler.context?.includes(contexts.onUnsubscribe))
      .forEach(processHandlersByDeviceContext)

    setIsUnsubscribed(true)
  }, [cookie?.key, handlers, processHandlersByDeviceContext])

  const resetState = useCallback(() => {
    Cookies.remove(cookie?.key, { sameSite: 'Strict' })
    window.onbeforeunload = null

    setIsTriggered(false)
    setIsUnsubscribed(false)
  }, [cookie?.key])

  const resetSettings = useCallback(() => {
    resetState()
    setSettings(initialSettings)
  }, [])

  const registerHandler = useCallback((handler: ExitIntentHandler) => {
    const handlerAlreadyPushed = handlers.find(
      (registeredHandler) => registeredHandler.id === handler.id
    )

    const _handler: ExitIntentHandler = {
      ...handler,
      context: handler?.context || [],
    }

    if (handlerAlreadyPushed) {
      handlers[handlers.indexOf(handlerAlreadyPushed)] = _handler

      return
    }

    handlers.push(_handler)
  }, [])

  const updateSettings = useCallback((newSettings: ExitIntentSettings = {}) => {
    resetState()

    setSettings((prevSettings) => ({
      ...(prevSettings || {}),
      ...(newSettings || {}),

      cookie: {
        ...(prevSettings?.cookie || {}),
        ...(newSettings?.cookie || {}),
      },

      desktop: {
        ...(prevSettings?.desktop || {}),
        ...(newSettings?.desktop || {}),
      },

      mobile: {
        ...(prevSettings?.mobile || {}),
        ...(newSettings?.mobile || {}),
      },
    }))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setIsUnsubscribed(isCookieUnsubscribed)
  }, [isCookieUnsubscribed])

  useEffect(() => {
    if (isMobile()) {
      const { execute, abort } = createDebounce(
        handleExitIntent,
        secondsToMiliseconds(mobile?.delayInSecondsToTrigger!)
      )

      const cleanups: Array<() => void> = []
      const trigger = () => {
        if (shouldNotTrigger.current) return
        execute()
      }

      cleanups.push(() => removeIdleEvents(trigger))

      if (!shouldNotTrigger.current) {
        if (mobile?.triggerOnIdle) {
          createIdleEvents(trigger)
        }

        if (mobile?.triggerOnScrollUp) {
          const { removeScrollDetection } = createScrollDetection({
            scrollThreshold: mobile?.scrollThreshold,
            scrollUpThreshold: mobile?.scrollUpThreshold,
            callback: trigger,
          })

          cleanups.push(removeScrollDetection)
        }

        if (mobile?.triggerOnEdgeSwipe) {
          const { removeEdgeSwipeDetection } = createEdgeSwipeDetection({
            edgeSwipeThreshold: mobile?.edgeSwipeThreshold,
            callback: trigger,
          })

          cleanups.push(removeEdgeSwipeDetection)
        }

        if (mobile?.triggerOnBackButton) {
          const { removeBackButtonDetection } = createBackButtonDetection({
            callback: trigger,
          })

          cleanups.push(removeBackButtonDetection)
        }

        if (mobile?.triggerOnInactivity) {
          const { removeActivityDetection } = createActivityDetection({
            inactivityThreshold: mobile?.inactivityThreshold,
            callback: trigger,
          })

          cleanups.push(removeActivityDetection)
        }
      }

      return () => {
        abort()
        cleanups.forEach((cleanup) => cleanup())
      }
    }

    if (isDesktop()) {
      const { execute, abort } = createDebounce(
        handleExitIntent,
        secondsToMiliseconds(desktop?.delayInSecondsToTrigger!)
      )

      let mouseLeaveTimer: ReturnType<typeof setTimeout>

      const handleMouseLeave = () => {
        if (shouldNotTrigger.current) return
        handleExitIntent()
      }

      if (desktop?.triggerOnIdle) {
        createIdleEvents(execute)
      }

      if (desktop?.triggerOnMouseLeave) {
        mouseLeaveTimer = setTimeout(() => {
          document.body.addEventListener('mouseleave', handleMouseLeave)
        }, secondsToMiliseconds(desktop.mouseLeaveDelayInSeconds!))
      }

      if (desktop?.useBeforeUnload) {
        window.onbeforeunload = (event: BeforeUnloadEvent) => {
          if (shouldNotTrigger.current) return

          handleExitIntent()

          // Prevent default browser behavior (page refresh on reload button)
          event.preventDefault()

          return ''
        }
      }

      return () => {
        abort()
        clearTimeout(mouseLeaveTimer)
        document.body.removeEventListener('mouseleave', handleMouseLeave),
          removeIdleEvents(execute),
          (window.onbeforeunload = null)
      }
    }
  })

  return {
    settings,
    resetState,
    isTriggered,
    unsubscribe,
    resetSettings,
    updateSettings,
    isUnsubscribed,
    registerHandler,
    willBeTriggered,
  }
}

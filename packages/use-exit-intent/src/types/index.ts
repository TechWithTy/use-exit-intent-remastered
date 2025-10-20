export type DeepRequired<T> = {
  [K in keyof T]: Required<DeepRequired<T[K]>>
}

export interface CookieOptions {
  key?: string
  daysToExpire?: number
}

export interface DesktopOptions {
  triggerOnIdle?: boolean
  triggerOnMouseLeave?: boolean
  delayInSecondsToTrigger?: number
  useBeforeUnload?: boolean
  mouseLeaveDelayInSeconds?: number
}

export interface MobileOptions {
  triggerOnIdle?: boolean
  delayInSecondsToTrigger?: number
  // New mobile detection strategies
  triggerOnScrollUp?: boolean
  scrollThreshold?: number
  scrollUpThreshold?: number
  triggerOnEdgeSwipe?: boolean
  edgeSwipeThreshold?: number
  triggerOnBackButton?: boolean
  triggerOnInactivity?: boolean
  inactivityThreshold?: number
}

export type InternalExitIntentSettings = Required<
  DeepRequired<ExitIntentSettings>
>

export interface ExitIntentSettings {
  cookie?: CookieOptions
  desktop?: DesktopOptions
  mobile?: MobileOptions
}

type EventPrefix<T extends string> = `on${T}`

export type Context =
  | EventPrefix<'Trigger' | 'Unsubscribe' | 'Desktop' | 'Mobile'>
  | void
  | ''

export interface ExitIntentHandler {
  id: string
  handler: Function
  context?: Context[]
}

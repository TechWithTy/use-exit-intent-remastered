import React from 'react'
import { render } from '@testing-library/react'

export interface RenderHookResult<T> {
  result: { current: T }
  rerender: (callback?: () => T) => void
  unmount: () => void
}

export function renderHook<T>(callback: () => T): RenderHookResult<T> {
  const result: { current: T } = { current: undefined as unknown as T }

  function TestComponent({ hook }: { hook: () => T }) {
    result.current = hook()
    return null
  }

  const { rerender, unmount } = render(<TestComponent hook={callback} />)

  return {
    result,
    rerender: (nextCallback = callback) => {
      rerender(<TestComponent hook={nextCallback} />)
    },
    unmount,
  }
}

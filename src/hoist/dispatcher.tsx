import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "react"
import { Func } from "../types"

const { ReactCurrentDispatcher } = __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

export function usingDispatcher <T> (dispatcher: Record <string, Function>, func: () => T): T {
  const prev = ReactCurrentDispatcher.current
  try {
    ReactCurrentDispatcher.current = dispatcher
    ReactCurrentDispatcher.current.readContext = prev.readContext
    const res = func()
    console.assert (!!res, "withDispatcher should be returning a defined value")
    console.assert (! (res instanceof Promise), "withDispatcher can't return promise")
    return res
  }
  finally {
    ReactCurrentDispatcher.current = prev
  }
}

export function makeDispatchable <T extends Func> (key: string, func: T) {
  const res = (...args: Parameters <T>) => {
    if (ReactCurrentDispatcher.current[key]) {
      return ReactCurrentDispatcher.current[key] (...args)
    }
    return func (...args)
  }

  return res as T
}

import { useContext, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from "react"

export const { ReactCurrentDispatcher } = __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED

export function useReadContext () {
  const { readContext } = ReactCurrentDispatcher.current
  return readContext as typeof useContext
}

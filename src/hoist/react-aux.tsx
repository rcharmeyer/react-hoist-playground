import { createRef, MutableRefObject } from "react"
import { makeDispatchable } from "./dispatcher"

export function createMutableRef <T> (initialValue: T) {
  const ref = createRef () as MutableRefObject <T>
  ref.current = initialValue
  return ref
}

export const useDebugLabel = makeDispatchable ("useDebugLabel", (label: string) => {})

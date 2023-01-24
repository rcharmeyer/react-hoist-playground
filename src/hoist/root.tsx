import { PropsWithChildren } from "react"
import { useAtomsDebugValue } from "jotai-devtools"
import { useGlobalWrite } from "./writer"
import { MetasymbolRoot } from "./metasymbols"

// Provider

function Jotai () {
  useGlobalWrite()
  useAtomsDebugValue()
  return null
}

export function AtomicRoot ({ children }: PropsWithChildren) {
  return <>
    <Jotai />
    <MetasymbolRoot>
      {children}
    </MetasymbolRoot>
  </>
}
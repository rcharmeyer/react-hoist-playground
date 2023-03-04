import { atom, useAtomValue } from "jotai"
import { makeDispatchable } from "./dispatcher"
import { toJotaiReadable } from "./writer"

export const useJotaiValue = makeDispatchable ("useJotaiValue", useAtomValue)

export function makeStateAtom (initialState: any) {
  const stateAtom = atom (initialState)
  const setStateAtom = toJotaiReadable (stateAtom)

  const tupleAtom = atom ((get) => {
    const state = get (stateAtom)
    console.log ("[tupleAtom:get]", state)
    
    const setState = get (setStateAtom)
    return [state, setState] as const
  })

  const setDebugLabel = (debugLabel: string) => {
    stateAtom.debugLabel = `${debugLabel}.state`
    setStateAtom.debugLabel = `${debugLabel}.setState`
    tupleAtom.debugLabel = `${debugLabel}`
  }

  return [ tupleAtom, setDebugLabel ] as const
}

export function makeReloadAtom (debugLabel: string) {
  const [ reloadAtom, setDebugLabel ] = makeStateAtom (Symbol())
              
  const res = atom ((get) => {
    const [ , setSymbol ] = get (reloadAtom)
    return () => setSymbol (Symbol())
  })
  
  const label = `reload(${debugLabel})`
  setDebugLabel (label)
  res.debugLabel = label
  
  return res
}

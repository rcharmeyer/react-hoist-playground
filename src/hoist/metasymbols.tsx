import { Atom, atom, useSetAtom, WritableAtom } from "jotai"
import { atomFamily } from "jotai/utils"
import { ComponentType, Context, createContext, memo, PropsWithChildren, Suspense, useContext, useEffect, useRef } from "react"

import { memoize } from "lodash-es"
import { makeDispatchable } from "./dispatcher"

// HELPER

function makeContextMemoized (context: Context <any>) {
  // TODO: prevent duplicate
  const { Provider } = context
  context.Provider = memo (Provider)
}

// GLOBAL MAPS

export const ROOT_METASYMBOL = Symbol()
const RootContext = createContext (undefined)
RootContext.displayName = "RootContext"
makeContextMemoized (RootContext)

export function MetasymbolRoot ({ children }: PropsWithChildren) {
  return (
    <MetasymbolContext.Provider __ignoreJsxMiddleware value={ROOT_METASYMBOL}>
      <RootContext.Provider __ignoreJsxMiddleware value={undefined}>
        {children}
      </RootContext.Provider>
    </MetasymbolContext.Provider>
  )
}

const MAPS = {
  getMetasymbolContext: new Map <symbol, Context <any>>(),
  getMetasymbolAncestors: new Map <symbol, symbol[]> (),
  getMetasymbolName: new Map <symbol, string> (),
}

MAPS.getMetasymbolContext.set (ROOT_METASYMBOL, RootContext)
MAPS.getMetasymbolAncestors.set (ROOT_METASYMBOL, [ ROOT_METASYMBOL ])
MAPS.getMetasymbolName.set (ROOT_METASYMBOL, "_root")

// if (typeof window !== "undefined") window.MAPS = MAPS

export function getMetasymbolContext (symbol: symbol) {
  const res = MAPS.getMetasymbolContext.get (symbol) as Context <unknown>
  console.assert (!!res, "[getMetasymbolContext] couldn't find symbol in map")
  return res
}

export function getMetasymbolName (symbol: symbol) {
  const res = MAPS.getMetasymbolName.get (symbol) as string
  console.assert (!!res, "[getMetasymbolName] couldn't find symbol in map")
  return res ?? "_none"
}

export function getMetasymbolAncestors (symbol: symbol) {
  const res = MAPS.getMetasymbolAncestors.get (symbol) as symbol[]
  console.assert (!!res, "[getMetasymbolAncestors] couldn't find symbol in map")
  return res
}

// External Helpers

export function getMetasymbolAncestorsAmountByContext (symbol: symbol, context: Context<any>) {
  const metasymbols = getMetasymbolAncestors (symbol)
    .filter (s => context === getMetasymbolContext (s))
  return metasymbols.length
}

// CONTEXT

const MetasymbolContext = createContext <symbol> (ROOT_METASYMBOL)
MetasymbolContext.displayName = "MetasymbolContext"
makeContextMemoized (MetasymbolContext)

export const useMetasymbolContext = () => useContext (MetasymbolContext)

type ReadRef = { current: () => unknown }

// TODO: Handle initial render edge cases
export const atomsByMetasymbol = atomFamily ((metasymbol: symbol) => {
  console.group ("[atomsByMetasymbol]")
  const theAtom: WritableAtom <any, any, any> = atom (atomsByMetasymbol.initialValue)
  
  const name = getMetasymbolName (metasymbol)
  console.log ("name:", name)
  
  const context = getMetasymbolContext (metasymbol)
  console.log ("context:", context.displayName)
  
  theAtom.debugLabel = `metasymbolValue(${context.displayName}@${name})`
  console.groupEnd ()
  return theAtom
})

function useMetasymbolAtomSync (metasymbol: symbol, value: any) {
  const atomRef = useRef <WritableAtom <any, any, any>> (undefined as any)
  if (!atomRef.current) {
    atomsByMetasymbol.initialValue = value
    atomRef.current = atomsByMetasymbol (metasymbol)
    atomsByMetasymbol.initialValue = undefined
  }

  const setValue = useSetAtom (atomRef.current)

  useEffect (() => {
    setValue (value)
  }, [ value ])
}

export const withHoistable = memoize (<T extends Context <any>["Provider"]>(provider: T) => {
  console.log ("[withHoistable]")

  const context = provider._context
  const Provider = provider // memo (provider)

  const res: T = ({ value, children }) => {
    const readRef = useRef <ReadRef["current"]> (undefined as any)
    readRef.current = () => value

    const parentMetasymbol = useMetasymbolContext ()
    
    const symbolRef = useRef <symbol> (undefined as any)
    
    const initializing = ! symbolRef.current
    if (initializing) {
      symbolRef.current = Symbol()
      
      const layer = getMetasymbolAncestorsAmountByContext (parentMetasymbol, context)
      const name = `${context.displayName}[${layer}]=${value}`
      
      const ancestors = getMetasymbolAncestors (parentMetasymbol)
      MAPS.getMetasymbolAncestors.set (symbolRef.current, [ symbolRef.current, ...ancestors ])
      MAPS.getMetasymbolContext.set (symbolRef.current, context)
      MAPS.getMetasymbolName.set (symbolRef.current, `${name}`)
    }

    useMetasymbolAtomSync (symbolRef.current, value)

    useEffect (() => () => {
      console.log ("Removing metasymbols on unmount")
      MAPS.getMetasymbolContext.delete (symbolRef.current)
      MAPS.getMetasymbolAncestors.delete (symbolRef.current)
      MAPS.getMetasymbolName.delete (symbolRef.current)
    }, [])

    // TODO: Make contexts suspendable without breaking hoist
    return (
      <MetasymbolContext.Provider value={symbolRef.current}>
        <Provider __ignoreJsxMiddleware value={value}>
          <Suspense>
            {children}
          </Suspense>
        </Provider>
      </MetasymbolContext.Provider>
    )
  }

  res.displayName = `withHoistable(${context.displayName})`
  return res
})

import { Atom, atom } from "jotai"
import React, { Context, DependencyList } from "react"
import {
  atomsByMetasymbol,
  getMetasymbolAncestors,
  getMetasymbolContext,
} from "./metasymbols"
import { Func, Func0, Func1, Func2, Runc1, Vunc1 } from "../types"
import { useStoreAux } from "./use-store"
import { atomWithReducer } from "jotai/utils"
import { makeStateAtom } from "./jotai"
import { depsEqual } from "./utils"
import { createMutableRef, useDebugLabel } from "./react-aux"

const NOT_IMPLEMENTED_HOOKS = [
  "useDeferredValue",
  "useId",
  "useImperativeHandle",
  "useInsertionEffect",
  "useLayoutEffect",
  "useSyncExternalStore",
  "useTransition",
]

export type Dispatcher = {
  useDebugLabel: typeof useDebugLabel,
  useStore: typeof useStoreAux,
  
  useCallback: typeof React.useCallback <any>,
  useContext: typeof React.useContext <any>,
  useEffect: typeof React.useEffect,
  useMemo: typeof React.useMemo <any>,
  useReducer: typeof React.useReducer <any>,
  useRef: typeof React.useRef <any>,
  useState: typeof React.useState <any>,
}

type Hook <T extends Func = Func> = {
  run: T, 
  setDebugLabel: Vunc1 <string>,
}

export type DispatcherParams = {
  mounted: boolean,
  index: number,
  hooks: Func[],
  readAtom: Runc1 <Atom <any>>,
  addContext: Vunc1 <Context <any>>,
  metasymbol: symbol,
  setLabel: Vunc1 <string>,
  labelCallbacks: Set <Vunc1 <string>>,
}

type HookMount <T extends Func> = Func <T, Parameters <T>>

export function makeStoreDispatcher (prefs: DispatcherParams) {
  const d: Dispatcher = {} as any

  for (const hook of NOT_IMPLEMENTED_HOOKS) {
    d[hook] = () => {
      throw new Error (`${hook} has not been implemented`)
    }
  }
  
  d.useDebugLabel = (label: string) => {
    // TODO: increase index?
    if (! prefs.mounted) prefs.setLabel (label)
  }
  d.useStore = (store) => {
    // TODO: increase index?

    console.group ("useStore")
    try {
      const res = prefs.readAtom (store (prefs.metasymbol))
      console.assert (! (res instanceof Promise), "useStoreAux can't return a promise")
      
      if (! prefs.mounted) {
        store.contexts.forEach ((context) => {
          prefs.addContext (context)
        })
      }
      return res
    }
    finally {
      console.groupEnd ()
    }
  }
    
  function subdispatcher <T extends Func> (mount: HookMount <T>) {
    return (...args: Parameters <T>) => {
      prefs.index += 1
      const i = prefs.index
      
      if (!prefs.mounted) prefs.hooks[i] = mount (...args)
      const hook = prefs.hooks[i] as T
      
      if (typeof hook === "function") {
        return hook (...args)
      }
      console.error ("hook should be a function")
    }
  }
    
  d.useContext = subdispatcher <typeof d.useContext> ((context) => {
    // if (initialized) console.assert (contexts.has (context))
    prefs.addContext (context)
        
    const metasymbol = getMetasymbolAncestors (prefs.metasymbol)
      .find (s => context === getMetasymbolContext (s))
    
    // if not in the Context
    if (!metasymbol) {
      console.log (`No found metasymbol for ${context.displayName ?? ""}`)
      // TODO: default value
      return () => {}
    }
    
    const valueAtom = atomsByMetasymbol (metasymbol)
    const hookAtom = atom ((get) => get (valueAtom))

    prefs.labelCallbacks.add ((label) => {
      hookAtom.debugLabel = `${label}.useContext`
    })

    return () => prefs.readAtom (hookAtom)
  })
  
  d.useReducer = subdispatcher <typeof d.useReducer> ((reducer, initialState, init) => {
    if (init) initialState = init (initialState)
    const theAtom = atomWithReducer (initialState, reducer)

    prefs.labelCallbacks.add ((label: string) => {
      theAtom.debugLabel = `${label}.useReducer`
    })
    
    return () => prefs.readAtom (theAtom)
  })
    
  d.useState = subdispatcher <typeof d.useState> ((initialState?: any) => {
    if (typeof initialState === "function") {
      initialState = initialState ()
    }
            
    const [ hookAtom, setDebugLabel ] = makeStateAtom (initialState)

    prefs.labelCallbacks.add ((label: string) => {
      setDebugLabel (`${label}.useState`)
    })

    return () => prefs.readAtom (hookAtom)
  })
    
  d.useRef = subdispatcher <typeof d.useRef> ((initialValue?: any) => {
    const ref = createMutableRef (initialValue)
    return () => ref
  })
    
  // Things with Deps
  
  type DepHook <R = any, T = any> = Func2 <R, T, DependencyList|undefined>
      
  function subdispatcherWithDeps <D extends DepHook, V = ReturnType <D>> (
    result: Func1 <ReturnType <D>, V>
  ) {
    return subdispatcher <DepHook <D, Func0 <V>>> ((init, initDeps) => {
      const prevDepsRef = createMutableRef (initDeps)
      const prevValueRef = createMutableRef (init())
      
      return (get, deps) => {
        if (depsEqual (deps, prevDepsRef.current)) {
          return result (prevValueRef.current)
        }
        return result (get())
      }
    })
  }
    
  const valueSub = subdispatcherWithDeps <typeof d.useMemo> ((x) => x)
  const atomSub = subdispatcherWithDeps <typeof d.useEffect, Atom<any>> ((x) => prefs.readAtom (x))
  
  d.useMemo = (getValue, deps) => valueSub (getValue, deps)
  d.useCallback = (callback, deps) => valueSub (() => callback, deps)
  
  d.useEffect = (effect, deps) => {
    return atomSub (() => {
      const theAtom = atom (null)
      theAtom.onMount = effect
      return theAtom
    }, deps)
  }
  
  return d
}

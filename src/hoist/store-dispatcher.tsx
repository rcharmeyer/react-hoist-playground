import { Atom, atom, getDefaultStore } from "jotai"
import React, { Context, createRef, MutableRefObject } from "react"
import {
  atomsByMetasymbol,
  getMetasymbolAncestors,
  getMetasymbolContext, 
  getMetasymbolName, 
  useMetasymbolContext,
} from "./metasymbols"
import { ReactCurrentDispatcher } from "./dispatcher"
import { toJotaiReadable } from "./writer"
import { Func, Func0, Func1, Func2, Runc1, Vunc1 } from "../types"
import { useStoreAux, useJotaiValue } from "./use-store"
import { atomWithReducer } from "jotai/utils"

type ReactPromise <T> = Promise<T> & {
    status?: 'pending' | 'fulfilled' | 'rejected'
    value?: T
    reason?: unknown
}

export function readPromise <T> (promise: ReactPromise <T>): T {
    if (promise.status === 'pending') {
        throw promise
    } 
    else if (promise.status === 'fulfilled') {
        return promise.value as T
    } 
    else if (promise.status === 'rejected') {
        throw promise.reason
    }
    else {
        promise.status = 'pending'
        promise.then(
            (v) => {
                promise.status = 'fulfilled'
                promise.value = v
            },
            (e) => {
                promise.status = 'rejected'
                promise.reason = e
            }
        )
        throw promise
    }
}

export const use: typeof readPromise = (promise) => {
    if (ReactCurrentDispatcher.current.use) {
        ReactCurrentDispatcher.current.use (promise)
    }
    return readPromise (promise)
}

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

function depsEqual (depsA: any, depsB: any) {
    const lenA = !Array.isArray (depsA) ? -1 : depsA.length
    const lenB = !Array.isArray (depsA) ? -1 : depsA.length
    
    console.assert (lenA === lenB, "[depsEqual] number of deps has changed")
    
    if (lenA < -1) return false
    
    for (let i = 0; i < lenA; i++) {
        if (depsA[i] !== depsB[i]) return false
    }
    return true
}

function createMutableRef <T> (initialValue: T) {
    const ref = createRef () as MutableRefObject <T>
    ref.current = initialValue
    return ref
}

export function useDebugLabel (label: string) {
    if (ReactCurrentDispatcher.current.useJotaiValue) {
        return ReactCurrentDispatcher.current.useDebugLabel (label)
    }
}

export type Dispatcher = {
    useDebugLabel: typeof useDebugLabel,
    useStore: typeof useStoreAux,
    useJotaiValue: typeof useJotaiValue,
    useMetasymbolContext: typeof useMetasymbolContext,
    
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
  hooks: Hook[],
  readAtom: Runc1 <Atom <any>>,
  addContext: Vunc1 <Context <any>>,
  metasymbol: symbol,
  setLabel: Vunc1 <string>,
}

type HookMount <T extends Func> = Func <Hook <T>, Parameters <T>>

export function withDispatcher <T> (dispatcher: Dispatcher, func: () => T): T {
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

export async function withDispatcherAsync <T> (dispatcher: Dispatcher, func: () => T): Promise <T> {
    let promise: Promise<any>|null = Promise.resolve ()
    let count = 0
    
    while (promise) {
        console.log (`promises count = ${count++}`)
        
        let prev
        try {
            await promise
            promise = null
            
            prev = ReactCurrentDispatcher.current
            ReactCurrentDispatcher.current = dispatcher
            return func()
        }
        catch (thrown) {
            if (thrown instanceof Promise) promise = thrown
            throw thrown
        }
        finally {
            if (prev) ReactCurrentDispatcher.current = prev
        }
    }
    
    console.assert (false, "[withDispatcherAsync] should have returned")
    return Promise.reject ("withDispatcherAsync internal error")
}

export function makeStoreDispatcher (prefs: DispatcherParams) {
    const d: Dispatcher = {} as any
    
    d.useDebugLabel = (label: string) => {
        prefs.index += 1
        if (! prefs.mounted) prefs.setLabel (label)
    }
    d.useStore = (store) => {
        console.group ("useStore")
        try {
            const res = useStoreAux (store)
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
    d.useJotaiValue = (argAtom: Atom <any>) => {
        prefs.index += 1
        const res = prefs.readAtom (argAtom)
        console.assert (! (res instanceof Promise), "useJotaiValue can't return a promise")
        console.log ("[useJotaiValue]", argAtom.debugLabel)
        console.log (res)
        /*
        if (res instanceof Promise) {
            console.group ("[useJotaiValue]")
            console.log (res.status)
            console.log (res.value)
            console.groupEnd()
            return use (res)
        }
        */
        return res
    }
    d.useMetasymbolContext = () => {
        prefs.index += 1
        return prefs.metasymbol
    }
    
    function subdispatcher <T extends Func> (mount: HookMount <T>) {
        return (...args: Parameters <T>) => {
            prefs.index += 1
            const i = prefs.index
            
            if (!prefs.mounted) prefs.hooks[i] = mount (...args)
            const hook = prefs.hooks[i].run as T
            
            if (typeof hook === "function") {
                return hook (...args)
            }
            console.error ("hook should be a function")
        }
    }
    
    /*
    d.useJotaiValue = subdispatcher <typeof d.useJotaiValue> (() => {
        if (count++ >= 10) throw new Error ("Exceeded repeats")
        
        const argAtomRef = createRef <Atom <any>> ()
        const wrapperAtomRef = createRef <Atom <any>> ()
        
        const onAtomChange = () => {                
            const [ loadedAtom ] = makeStateAtom (false)
            
            wrapperAtomRef.current = atom ((get) => {
                const res = get (argAtomRef.current)
                if (! (res instanceof Promise)) return res
                
                const [ , setLoaded ] = get (loadedAtom)
                return res.finally (() => {
                    setLoaded (true)
                })
            })
        }
        
        return {
            run: (argAtom: Atom <any>) => {
                if (argAtom !== argAtomRef.current) {
                    argAtomRef.current = argAtom
                    onAtomChange ()
                }
                const res = prefs.readAtom (wrapperAtomRef.current)
                if (res instanceof Promise) return readPromise (res)
                else res
            },
            setDebugLabel: () => {},
        }
    })
    */
    
    d.useContext = subdispatcher <typeof d.useContext> ((context) => {
        console.assert (context.hoistable, "[useContext] context.hoistable")
        
        if (!context.hoistable) {
            // temporary assume Jotai's StoreContext
            return {
                run: () => getDefaultStore(),
                setDebugLabel: () => {},
            }
            
            // TODO: For compatibility, readContext doesn't work
            // return d.readContext (context)
        }
        
        // if (initialized) console.assert (contexts.has (context))
        prefs.addContext (context)
        
        const metasymbols = getMetasymbolAncestors (prefs.metasymbol)
        console.log ("metasymbol ancestor amount =", metasymbols.length)
                
        const metasymbol = metasymbols
            .find (s => context === getMetasymbolContext (s))
        
        // if not in the Context
        // TODO: default value
        if (!metasymbol) {
            console.log (`No found metasymbol for ${context.displayName}`)
            return {
                run: () => {},
                setDebugLabel: () => {},
            }
        }
        
        const valueAtom = atomsByMetasymbol (metasymbol)
        const hookAtom = atom ((get) => get (valueAtom))
            
        return {
            run: () => prefs.readAtom (hookAtom),
            setDebugLabel: (label) => {
                hookAtom.debugLabel = `${label}.useContext`
            }
        }
    })
    
    // TODO: dispatcher.useReducer = () => {}
    
    d.useReducer = subdispatcher <typeof d.useReducer> ((reducer, initialState, init) => {
        if (init) initialState = init (initialState)
        const theAtom = atomWithReducer (initialState, reducer)
        
        return {
            run: () => prefs.readAtom (theAtom),
            setDebugLabel: (label: string) => {
                theAtom.debugLabel = `${label}.useReducer`
            }
        }
    })
    
    d.useState = subdispatcher <typeof d.useState> ((initialState?: any) => {
        if (typeof initialState === "function") {
            initialState = initialState ()
        }
                
        const [ hookAtom, setDebugLabel ] = makeStateAtom (initialState)
        return {
            run: () => prefs.readAtom (hookAtom),
            setDebugLabel: (label: string) => {
                setDebugLabel (`${label}.useState`)
            },
        }
    })
    
    d.useRef = subdispatcher <typeof d.useRef> ((initialValue?: any) => {
        const ref = createMutableRef (initialValue)
        return {
            run: () => ref,
            // TODO: support ref debug label
            setDebugLabel: () => {},
        }
    })
    
    // Things with Deps
    
    type DepHook <R = any, T = any> = Func2 <R, T, any[]>
        
    function subdispatcherWithDeps <D extends DepHook, V = ReturnType <D>> (
        result: Func1 <ReturnType <D>, V>
    ) {
        return subdispatcher <DepHook <D, Func0 <V>>> ((init, initDeps) => {
            const prevDepsRef = createMutableRef (initDeps)
            const prevValueRef = createMutableRef (init())
            
            return {
                run: (get, deps) => {
                    if (depsEqual (deps, prevDepsRef.current)) {
                        return result (prevValueRef.current)
                    }
                    return result (get())
                },
                // TODO: support memo debug label
                setDebugLabel: () => {},
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
    
    // TODO: Implement other hooks
    
    d.useLayoutEffect = () => {
        throw new Error ("useLayoutEffect has not been implemented")
    }
    
    d.useInsertionEffect = () => {
        throw new Error ("useInsertionEffect has not been implemented")
    }
    
    d.useSyncExternalStore = () => {
        throw new Error ("useSyncExternalStore has not been implemented")
    }
    
    d.useTransition = () => {
        throw new Error ("useTransition has not been implemented")
    }
    
    d.useId = () => {
        throw new Error ("useId has not been implemented")
    }
    
    d.useDebugValue = () => {
        console.error ("useDebugValue has not been implemented")
    }
    
    d.useDeferredValue = () => {
        throw new Error ("useDeferredValue has not been implemented")
    }
    
    d.useImperativeHandle = () => {
        throw new Error ("useImperativeHandle has not been implemented")
    }
    
    /*
    d.useMemo = subdispatcher <typeof d.useMemo> ((getInitialValue, initialDeps) => {
        const prevDepsRef = createMutableRef (initialDeps)
        const prevValueRef = createMutableRef (getInitialValue())
        
        return {
            run: (getValue, deps) => {
                if (depsEqual (deps, prevDepsRef.current)) {
                    return prevValueRef.current
                }
                return getValue()
            },
            // TODO: support memo debug label
            setDebugLabel: () => {},
        }
    })
    
    d.useCallback = (callback, deps) => {
        return d.useMemo (() => callback, deps)
    }
    */
    
    return d
}
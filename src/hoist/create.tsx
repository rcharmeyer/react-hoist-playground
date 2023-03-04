import { Atom, atom } from "jotai"
import { Context } from "react"
import {
    getMetasymbolAncestors,
    getMetasymbolContext, 
    getMetasymbolName,
    ROOT_METASYMBOL,
} from "./metasymbols"
import { DispatcherParams, makeStateAtom, makeStoreDispatcher, readPromise, withDispatcher } from "./store-dispatcher"
import { Func, Vunc0 } from "../types"

function makeReloadAtom (debugLabel: string) {
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

function family <T> (init: (key: symbol) => Atom <T>) {
  const map = new Map <symbol, Atom<T>>()
  const res = (key: symbol) => {
    if (!map.has (key)) {
      let val = init (key)
      // if (res.middleware) val = res.middleware (val, key)
      
      // sometimes we may want our init function to set the value in map
      if (!map.has (key)) map.set (key, val)
    }
    return map.get (key) as Atom <T>
  }
  
  res.map = map // exposes map so we can modify as needed
  return res
}

type LazyRefObject <T> = {
  initialized: boolean,
  current: T,
}

function _do <T extends Func> (func: T) {
  return func()
}

function lazyRef <T> (init: () => T): LazyRefObject <T> {
  let value: T
  let initialized = false
  
  return Object.defineProperties ({} as LazyRefObject <T>, {
    initialized: {
      get () { return initialized },
    },
    current: {
      get () {
        if (!initialized) {
          initialized = true
          value = init()
        }
        return value
      }
    }
  })
}

export function createStore <T extends Promise <any>> (hook: () => T): any/*Store <T>*/ {
  const labelRef = { current: "" }
  console.log ("[createStore]")
  console.log (labelRef)
  
  let initialized = false
  
  const labelCallbacks = new Set <Vunc0> ()
  const setLabel = (nextLabel: string) => {
    if (labelRef.current) {
      console.assert (labelRef.current === nextLabel, "label === nextLabel")
      return
    }
    labelRef.current = nextLabel
    for (const callback of labelCallbacks) callback ()
  }
    
  /*
  let selfFamily: ReturnType <typeof family <T>> & {
      contexts: Set <Context<any>>
  }
  */
  let selfFamily: any
  
  const contextsRef = lazyRef (() => {
    selfFamily.labelRef = labelRef
    selfFamily.debug = () => {
      console.group ("[selfFamily.debug]", selfFamily.labelRef.current)
      try {
        for (const [ key, val ] of selfFamily.map.entries()) {
          const entryName = getMetasymbolName (key)
          console.log (entryName, val)
        }
      }
      finally {
        console.groupEnd()
      }
    }
    
    selfFamily.contexts = new Set ()
    return selfFamily.contexts
  })
      
  function getScope (metasymbol: symbol): symbol {
    console.assert (initialized, "[getScope] initialized")
    
    const metasymbols = getMetasymbolAncestors (metasymbol)
    console.assert (!!metasymbols, "[getScope] !!metasymbols" + getMetasymbolName (metasymbol))
    console.log ("getScope", metasymbols.length, contextsRef.current)
    
    const res = metasymbols
      .find (s => contextsRef.current.has (getMetasymbolContext (s)))
    
    return res ?? ROOT_METASYMBOL
  }

  function createAtom (metasymbol: symbol) {
    let createdAtom: Atom <any> = null as any
  
    function writeLabel () {
        console.group ("[writeLabel]")
        const trueScope = getScope (metasymbol)
        const scopeName = getMetasymbolName (trueScope)
        const debugLabel = `${labelRef.current}@${scopeName}`
        
        createdAtom.debugLabel = debugLabel
        
        const len = prefs.hooks.length
        for (let i = 0; i < len; i++) {
            const hook = prefs.hooks[i]
            hook?.setDebugLabel?.(`${debugLabel}[${i}]`)
        }
        console.groupEnd ()
    }
    
    const prefs: DispatcherParams = {
        mounted: false,
        index: -1,
        hooks: [],
        readAtom: null as any,
        addContext: (c: Context <any>) => contextsRef.current.add (c),
        metasymbol,
        setLabel,
    }
    
    const dispatcher = makeStoreDispatcher (prefs)
    
    const reloadAtom = makeReloadAtom (labelRef.current)
    
    return (createdAtom = atom ((get) => {
      const reload = get (reloadAtom)
      
      console.group ("[createdAtom]", labelRef.current || labelRef)
      
      try {
        prefs.readAtom = get
        // clear hooks if error or suspense
        if (!prefs.mounted) prefs.hooks = []
        
        selfFamily?.debug?.()
        console.log ("name =", getMetasymbolName (metasymbol))
        
        const res = withDispatcher (dispatcher, hook)                
        console.assert (! (res instanceof Promise), "! (res instanceof Promise)")
        
        // set debug label
        if (!prefs.mounted) {
          if (!initialized) console.log ("initialized store")
          console.log ("mounted")
          initialized = true
          
          prefs.mounted = true
          writeLabel ()
        }
        
        return res
      }
      catch (thrown) {
        console.log ("caught", thrown)
        if (thrown instanceof Promise) {
          console.assert (thrown.status === "pending", "promise must be pending")
          
          readPromise (_do (async () => {
            await thrown
            console.log (thrown)
            console.assert (thrown.status, "promise should have a status")
            console.assert (thrown.status === "fulfilled", "promise should be fulfilled")
            console.log ("promise has been concluded")
            reload ()
          }))
          
          console.assert (false, "readPromise should have thrown")
        }
        throw thrown
      }
      finally {
        prefs.index = -1
        console.groupEnd ()
      }
    }))
  }

  return (selfFamily = family ((metasymbol: symbol) => {
    const name = getMetasymbolName (metasymbol)
    
    contextsRef.current // get that initialized
    
    console.group ("[selfFamily]", labelRef.current || labelRef)
    
    try {
      const atomRef = lazyRef (() => createAtom (metasymbol))
      
      if (initialized) {
        console.assert (!!metasymbol, "[selfFamily] metasymbol")
        const scope = getScope (metasymbol)
        if (scope === metasymbol) return atomRef.current
        return selfFamily (scope)
      }
      
      let selfAtom: Atom<any>
      labelCallbacks.add (() => {
        selfAtom.debugLabel = `${labelRef.current}@${name}#wrapper`
      })
      
      // TODO: Experiment with setting the initialAtom in to the map
      return (selfAtom = atom ((get) => {
        console.group ("[selfAtom]", labelRef.current || labelRef)
        try {
          // need atom to run so that context can be populated
          if (!initialized) {
            console.log ("initializing selfAtom")
            get (atomRef.current)
            console.log ("initialized selfAtom")
          }
          const scope: symbol = getScope (metasymbol)
          
          if (scope === metasymbol) return get (atomRef.current)
          
          // save in map to avoid duplicate initialization
          console.assert (atomRef.initialized, "[initialAtom] atomRef.initialized")
          if (!selfFamily.map.has (scope)) {
            selfFamily.map.set (scope, atomRef.current)
            console.assert (selfFamily.map.has (scope), "[initialAtom] storeFamily.map.has (scope)")
          }
          
          return get (selfFamily (scope))
        }
        catch (thrown) {
          console.log ("caught")
          if (thrown instanceof Promise) {
            console.log (thrown)
            console.assert (thrown.status, "promise should have a status")
            console.assert (thrown.status === "pending", "thrown.status === 'pending'")
          }
          throw thrown
        }
        finally {
          console.groupEnd ()
        }
      }))
    }
    catch (thrown) {
      console.log ("caught")
      throw thrown
    }
    finally {
      console.groupEnd ()
    }
  }))
}

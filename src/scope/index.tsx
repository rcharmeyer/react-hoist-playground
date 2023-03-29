import { memoize } from "lodash-es"
import { ComponentType, createContext, memo, PropsWithChildren, PureComponent, Suspense, useContext, useMemo, useState, useSyncExternalStore } from "react"
import { useEvent } from "../hooks"
import { Func, Func0, Vunc, Vunc0 } from "../types"

type Snapshot = {
  result?: any,
  thrown?: Error|Promise<any>,
}

type StoreConsumable = {
  subscribe: (callback: () => void) => () => void,
  getSnapshot: () => Snapshot,
}

type StoreBuilder = (func: Func) => StoreConsumable

type Scope = ComponentType <PropsWithChildren> & {
  context: React.Context <StoreBuilder>,
}

type Store <T> = {
  hook: Func0 <T>,
  deps: Scope[],
}

const ScopesContext = createContext <Scope[]> ([])

function ScopeProvider (props: PropsWithChildren <{ scope: Scope }>) {
  const scopes = useContext (ScopesContext)
  
  const value = useMemo (() => {
    return [ props.scope, ...scopes ]
  }, [ props.scope, scopes ])
  
  return (
    <ScopesContext.Provider value={value}>
      {props.children}
    </ScopesContext.Provider>
  )
}

function createExternalStore <T> (snapshot: T) {
  const listeners = new Set <Vunc0> ()

  return {
    subscribe: (callback: () => void) => {
      listeners.add (callback)
      return () => {
        listeners.delete (callback)
      }
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => snapshot,
    setSnapshot: (nextSnapshot: T) => {
      if (snapshot !== nextSnapshot) {
        snapshot = nextSnapshot
        listeners.forEach ((l) => l ())
      }
    }
  }
}

type RendererProps = {
  hook: Func0 <any>,
  setSnapshot: (snapshot: Snapshot) => void,
}

function HookRenderer (props: RendererProps) {
  console.log ("HookRenderer")
  const result = props.hook()
  props.setSnapshot ({ result })
  return null
}

class StoreRenderer extends PureComponent <RendererProps> {
  componentDidCatch (thrown: any) {
    this.props.setSnapshot ({ thrown })
  }

  render () {
    console.log ("StoreRenderer")
    return <HookRenderer {...this.props} />
  }
}

export function createScope () {
  const InternalContext = createContext <StoreBuilder> (undefined as any)
  InternalContext.Provider = memo (InternalContext.Provider)

  const provider: Scope = memo ((props: PropsWithChildren) => {
    console.log ("Scope running")
    
    const rendererStore = useMemo (() => {
      return createExternalStore <RendererProps[]> ([])
    }, [])

    const addRenderer = useEvent ((nextRenderer) => {
      rendererStore.setSnapshot ([
        ...rendererStore.getSnapshot (),
        nextRenderer 
      ])
    })

    const [ getStore ] = useState (() => memoize ((hook) => {
      console.log ("getting store")

      if (!hook) throw new Error ("hook not found")

      let onInitResolve: Vunc
      const thrown = new Promise <void> ((resolve) => {
        onInitResolve = () => {
          console.log ("onInitResolve")
          resolve()
        }
      })

      const hookStore = createExternalStore <Snapshot> ({ thrown })

      // unsuspend after init
      const onInitCleanup = hookStore.subscribe (() => {
        onInitResolve ()
        onInitCleanup ()
        console.log ("after onInitCleanup")
      })

      addRenderer ({
        hook,
        setSnapshot: hookStore.setSnapshot,
      })

      return hookStore
    }))

    const renderers = useSyncExternalStore (
      rendererStore.subscribe, 
      rendererStore.getSnapshot,
      rendererStore.getSnapshot,
    )

    const renderedStores = renderers.map ((rendererProps, i) => (
      <StoreRenderer key={i} {...rendererProps} />
    ))

    return (
      <InternalContext.Provider value={getStore}>
        <ScopeProvider scope={provider}>
          {renderedStores}
          <Suspense>
            {props.children}
          </Suspense>
        </ScopeProvider>
      </InternalContext.Provider>
    )
  })

  // TODO: Support imperfect scoping
  provider.context = InternalContext

  const hoist = <T extends Func0> (hook: T): T => {
    const res: any = () => {
      const getStore = useContext (InternalContext)
      const store = getStore (hook)
      const { result, thrown } = useSyncExternalStore (
        store.subscribe, 
        store.getSnapshot,
        store.getSnapshot,
      )

      if (thrown) throw thrown
      return result
    }

    return res as T
  }

  type TheScope = typeof provider & {
    hoist: typeof hoist
  }

  const scope: TheScope = provider as any
  scope.hoist = hoist
  return scope
}

export function createStore <T> (hook: () => T, deps: Scope[]): Store<T> {
  return {
    hook,
    deps,
  }
}

export function useStore <T> (store: Store <T>): T {
  const scopes = useContext (ScopesContext)

  if (!store.deps.length) throw new Error ("No scopes were found for the store")

  const scope = useMemo (() => {
    const inStore = (s: Scope) => store.deps.includes (s)
    const inScope = (s: Scope) => scopes.includes (s)

    if (! store.deps.every (inScope)) throw new Error ("Some scopes from store were not found")

    return scopes.find (inStore)
  }, [ scopes, store.deps ])

  if (!scope) throw new Error ("No scope was found")

  const getStoreInstance = useContext (scope.context)
  const { subscribe, getSnapshot } = getStoreInstance (store.hook)
  const { result, thrown } = useSyncExternalStore (subscribe, getSnapshot, getSnapshot)

  if (thrown) throw thrown
  return result
}

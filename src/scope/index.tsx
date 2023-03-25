import { memoize } from "lodash"
import { ComponentType, createContext, memo, PropsWithChildren, Suspense, useContext, useMemo, useState, useSyncExternalStore } from "react"
import { Func } from "../types"

export function createScope () {
  const InternalContext = createContext <{
    initHook: (key: symbol, func: Func) => void,
    getStore: (symbol: symbol, ...args: any[]) => any,
  }> (undefined as any)

  InternalContext.Provider = memo (InternalContext.Provider)

  const provider = memo ((props: PropsWithChildren) => {
    const [ storeComponents, setStoreComponents ] = useState <ComponentType[]> ([])

    const getStore = useMemo (() => memoize ((hook, ...args) => {
      if (!hook) throw new Error ("hook not found")

      const StoreComponent = () => {
        let result: any
        let thrown: any

        try {
          result = hook ()
        }
        catch (_thrown) {
          thrown = _thrown

        }
        finally {
          useSyncExternalStore ()
          if (thrown) throw thrown
        }
      }

      setStoreComponents ([ ...storeComponents, StoreComponent ])
    }), [])

    const value = useMemo (() => ({ init, read }), [init, read])

    const stores = storeComponents.map ((StoreComponent) => (
      <Suspense>
        <StoreComponent />
      </Suspense>
    ))

    return (
      <InternalContext.Provider value={value}>
        <Suspense>
          {props.children}
        </Suspense>
      </InternalContext.Provider>
    )
  })

  const hoist = <T extends Func> (hook: T): T => {
    const res: any = (...args: any[]): any => {
      const getStore = useContext (InternalContext)
      const store = getStore (hook, ...args)
      const { result, thrown } = useSyncExternalStore (store.subscribe, store.read)
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

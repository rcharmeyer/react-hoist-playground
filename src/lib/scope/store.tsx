import { memoize } from "lodash-es"
import { Func } from "../types"
import { Scope, Store } from "./types"
import { useLowestScopeIn } from "./scopes-context"
import { useContext } from "react"
import { useInternalStore } from "./internal-store"

export function createStore <T> (hook: () => T, deps: Scope[]): Store<T> {
  return {
    hook,
    deps,
  }
}

export function useStore <T> (store: Store <T>): T {
  const scope = useLowestScopeIn (store.deps)

  const getStoreInstance = useContext (scope.context)
  const { result, thrown } = useInternalStore (getStoreInstance (store.hook))

  if (thrown) throw thrown
  return result
}

// bonus

export function createStoreFamily <T extends Func> (hook: T, deps: Scope[]) {
  return memoize ((...args: Parameters <T>) => {
    const res = createStore (() => hook (...args), deps)
    return res as Store <ReturnType <T>>
  })
}

export function hoist <T extends Func> (hook: T, deps: Scope[]) {
  const storeFamily = createStoreFamily <T> (hook, deps)
  return (...args: Parameters <T>): ReturnType <T> => {
    const store = storeFamily (...args)
    return useStore (store)
  }
}

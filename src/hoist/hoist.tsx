import { memoize } from "lodash-es"
import { Func } from "../types"
import { createStore } from "./create"
import { Store, useStore } from "./use-store"

export function createStoreFamily <T extends Func> (hook: T): Store <ReturnType <T>> {
  console.log ("[createStoreFamily]")
  return memoize ((...args: Parameters <T>): Store<T> => {
    console.log ("[createStoreFamily] inner:", ...args)
    return createStore (() => hook (...args))
  })
}

export function hoist <T extends Func> (hook: T) {
  const storeFamily = createStoreFamily (hook)
  return (...args: Parameters <T>): ReturnType <T> => {
    const store = storeFamily (...args)
    // console.log ("[hoist]")
    // store?.debug?.()
    return useStore (store)
  }
}

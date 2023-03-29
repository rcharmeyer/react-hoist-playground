import { useSyncExternalStore } from "react"
import { Vunc0 } from "../types"
import { InternalStore } from "./types"

export function createInternalStore <T> (snapshot: T): InternalStore <T> {
  const listeners = new Set <Vunc0> ()

  return {
    read: () => snapshot,
    subscribe: (callback) => {
      listeners.add (callback)
      return () => {
        listeners.delete (callback)
      }
    },
    write: (nextSnapshot) => {
      if (snapshot !== nextSnapshot) {
        snapshot = nextSnapshot
        listeners.forEach ((l) => l ())
      }
    }
  }
}

export function createInternalListStore <T> () {
  const store = createInternalStore <T[]> ([])
  return {
    ...store,
    add: (item: T) => {
      store.write ([ ...store.read (), item ])
    }
  }
}

export function useInternalStore <T> (store: InternalStore <T>) {
  return useSyncExternalStore <T> (store.subscribe, store.read, store.read)
}

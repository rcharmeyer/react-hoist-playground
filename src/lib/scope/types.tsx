import { ComponentType, PropsWithChildren } from "react"
import { Func, Func0, Vunc0 } from "../types"

export type Snapshot = {
  result?: any,
  thrown?: Error|Promise<any>,
}

export type InternalStore <T> = {
  subscribe: (callback: Vunc0) => Vunc0,
  read: () => T,
  write: (arg: T) => void,
}

export type StoreBuilder = (func: Func) => InternalStore <Snapshot>

export type Scope = ComponentType <PropsWithChildren> & {
  context: React.Context <StoreBuilder>,
}

export type Store <T> = {
  hook: Func0 <T>,
  deps: Scope[],
}

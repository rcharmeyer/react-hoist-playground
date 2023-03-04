import { Atom, useAtomValue } from "jotai"
import { Context, useRef } from "react"
import { useMetasymbolContext } from "./metasymbols"
import { ReactCurrentDispatcher } from "./dispatcher"

export type Store <T = any> = (metasymbol: symbol) => Atom<T> & {
  contexts?: Set <Context<any>>
}
export type InferStoreType <T> = T extends Store <infer A> ? Awaited <A> : never

type JotaiHook = typeof useAtomValue
export const useJotaiValue: JotaiHook = (theAtom: Atom<any>) => {
  if (ReactCurrentDispatcher.current.useJotaiValue) {
    return ReactCurrentDispatcher.current.useJotaiValue (theAtom)
  }
  return useAtomValue (theAtom)
}

export function useStoreAux <S extends Store> (store: S): InferStoreType <S> {
  const metasymbol = useMetasymbolContext () // doesn't change
  return useJotaiValue (store (metasymbol))
}

export const useStore: typeof useStoreAux = (store) => {
  if (ReactCurrentDispatcher.current.useStore) {
    return ReactCurrentDispatcher.current.useStore (store)
  }
  return useStoreAux (store)
}

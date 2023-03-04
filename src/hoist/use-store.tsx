import { Atom } from "jotai"
import { Context } from "react"
import { makeDispatchable } from "./dispatcher"
import { useJotaiValue } from "./jotai"
import { useMetasymbolContext } from "./metasymbols"

export type Store <T = any> = (metasymbol: symbol) => Atom<T> & {
  contexts?: Set <Context<any>>
}
export type InferStoreType <T> = T extends Store <infer A> ? Awaited <A> : never

export function useStoreAux <S extends Store> (store: S): InferStoreType <S> {
  const metasymbol = useMetasymbolContext () // doesn't change
  return useJotaiValue (store (metasymbol))
}

export const useStore = makeDispatchable ("useStore", useStoreAux)


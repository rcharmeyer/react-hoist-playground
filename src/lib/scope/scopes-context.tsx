import { createContext, PropsWithChildren, useContext, useMemo } from "react"
import { Scope } from "./types"

const ScopesContext = createContext <Scope[]> ([])

export function ScopeProvider (props: PropsWithChildren <{ scope: Scope }>) {
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

export function useLowestScopeIn (consumerScopes: Scope[]) {
  const ancestorScopes = useContext (ScopesContext)

  if (!consumerScopes.length) throw new Error ("No scopes were found for the store")

  const scope = useMemo (() => {
    const inStore = (s: Scope) => consumerScopes.includes (s)
    const inScope = (s: Scope) => ancestorScopes.includes (s)

    if (! consumerScopes.every (inScope)) {
      throw new Error ("Some scopes from store were not found")
    }

    return ancestorScopes.find (inStore)
  }, [ ancestorScopes, consumerScopes ])

  if (!scope) throw new Error ("No scope was found")

  return scope
}

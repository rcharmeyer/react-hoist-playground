import { createContext, memo, PropsWithChildren, useContext } from "react"
import { createScope, createStore, useStore } from "@rcharmeyer/react-utils"

export const SkudataScope = createScope ()

const SkudataIdContext = createContext ("")
SkudataIdContext.displayName = "SkudataIdContext"
SkudataIdContext.Provider = memo (SkudataIdContext.Provider)

export function SkudataProvider (props: PropsWithChildren <{
  id: string,
}>) {
  return (
    <SkudataIdContext.Provider value={props.id}>
      <SkudataScope key={props.id}>
        {props.children}
      </SkudataScope>
    </SkudataIdContext.Provider>
  )
}

export const skudataIdStore = createStore (() => {
  return useContext (SkudataIdContext)
}, [ SkudataScope ])

export function useSkudataId () {
  return useStore (skudataIdStore)
}

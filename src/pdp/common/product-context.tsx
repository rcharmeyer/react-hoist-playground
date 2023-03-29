import { createContext, memo, PropsWithChildren, useContext } from "react"
import { createScope, createStore, useStore } from "../../lib/scope"

export const ProductScope = createScope ()

const ProductIdContext = createContext ("")
ProductIdContext.displayName = "ProductIdContext"
ProductIdContext.Provider = memo (ProductIdContext.Provider)

export function ProductProvider (props: PropsWithChildren <{
  id: string,
}>) {
  return (
    <ProductIdContext.Provider value={props.id}>
      <ProductScope key={props.id}>
        {props.children}
      </ProductScope>
    </ProductIdContext.Provider>
  )
}

export function useProductId () {
  return useContext (ProductIdContext)
}

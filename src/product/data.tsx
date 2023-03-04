import { useContext, useMemo } from "react"
import { fetchProductById, Skudata } from "../data/product"
import { hoist, useDebugLabel } from "../hoist"
import { makeAsync } from "../hooks"
import { ProductIdContext } from "./context"

const useProductDataById = makeAsync (fetchProductById)

export const useProduct = hoist (() => {
  console.group ("[useProduct]")
  
  try {
    const pid = useContext (ProductIdContext)
    console.log ("pid =", pid)
    useDebugLabel (`useProduct`)
    
    const res = useProductDataById (pid)
    console.log ("returns", res)
    console.assert (!!res, "expected product data")
    
    return res // ?? getProductById (pid)
  }
  finally {
    console.groupEnd ()
  }
})

// no idea why this works but if I wrap this in hoist it doesn't

export const useSkudataBy = hoist ((sku: string) => {
  useDebugLabel (`useSkudataBy?sku=${sku}`)
  
  const { skudatas } = useProduct()
  
  return useMemo (() => {
    const res = skudatas.find (s => s.id === sku)
    return res as Skudata
  }, [ sku ])
})

import { useContext, useMemo, useState } from "react"
import { hoist, useDebugLabel } from "../hoist"
import { useEvent } from "../hooks"
import { ProductIdContext, SkudataIdContext } from "./context"
import { useProduct } from "./data"

const useSelectedSkuState = hoist (() => {
  useContext (ProductIdContext)
  useDebugLabel ("useSelectedSkuState")
  
  const [ selectedSku, setSelectedSku ] = useState ("")
  return { selectedSku, setSelectedSku }
})

export const useActiveSku = hoist (() => {
  useDebugLabel ("useActiveSku")
  
  const { skudatas } = useProduct()
  const { selectedSku } = useSelectedSkuState ()
  console.log ("selectedSku", selectedSku)
  
  const defaultSku = useMemo (() => {
    console.assert (!!skudatas.length)
    return skudatas[0].id
  }, [ skudatas ])
  
  const res = selectedSku || defaultSku
  // useDebugValue (res)
  console.assert (!!res)
  return res
})

export const useSkuSelect = hoist (() => {
  const sku = useContext (SkudataIdContext)

  useDebugLabel ("useSkuSelect")
  const { selectedSku, setSelectedSku } = useSelectedSkuState ()
  const isSelected = sku === selectedSku
  
  const onSkuSelect = useEvent (() => {
    setSelectedSku (sku)
  })
  
  return useMemo (() => ({ 
    isSelected, 
    onSkuSelect
  }), [ isSelected, onSkuSelect ])
})

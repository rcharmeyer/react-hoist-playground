import { useDebugValue, useMemo, useState } from "react"
import { useEvent } from "../../lib/hooks"
import { ProductScope } from "./product-id"
import { useProduct } from "./data"
import { hoist } from "../../lib/scope"
import { SkudataScope } from "./skudata-id"

const useSelectedSkuState = hoist (() => {
  // useDebugLabel (`useSelectedSkuState`)
  
  const [ selectedSku, setSelectedSku ] = useState ("")
  return { selectedSku, setSelectedSku }
}, [ ProductScope ])

export const useActiveSku = hoist (() => {
  // useDebugLabel ("useActiveSku")
  
  const { skudatas } = useProduct()
  const { selectedSku } = useSelectedSkuState ()
  console.log ("selectedSku", selectedSku)
  
  const defaultSku = useMemo (() => {
    console.assert (!!skudatas.length)
    return skudatas[0].id
  }, [ skudatas ])
  
  const res = selectedSku || defaultSku
  useDebugValue (res)
  console.assert (!!res)
  return res
}, [ ProductScope ])

export const useSkuSelect = hoist ((sku: string) => {
  // useDebugLabel ("useSkuSelect")

  const { selectedSku, setSelectedSku } = useSelectedSkuState ()
  const isSelected = sku === selectedSku
  
  const onSkuSelect = useEvent (() => {
    setSelectedSku (sku)
  })
  
  return { isSelected, onSkuSelect }
}, [ ProductScope, SkudataScope ])

import { Suspense } from "react"
import { useProduct, useSkudataBy } from "./data"
import { useSkuSelect } from "./selected-sku"
import { SkudataProvider, useSkudataId } from "./skudata-id"

function ColorInput () {
  const sku = useSkudataId()
  
  const { swatch } = useSkudataBy (sku)
  const { isSelected, onSkuSelect } = useSkuSelect (sku)
  
  let className = "h-6 w-6 object-cover rounded-full ring-offset-2 cursor-pointer"
  
  if (isSelected) className += " ring-1 ring-slate-400"
  else className += " ring-0 hover:ring-1 ring-slate-200"
  
  return <img className={className} src={swatch} onClick={onSkuSelect} />
}

function ColorInputFallback () {
  return (
    <div className="h-6 w-6 rounded-full bg-slate-100" />
  )
}

export function ColorInputs (props: {
  amount?: number,
}) {
  const { skudatas } = useProduct()
  
  const skus = skudatas
    .map (s => s.id)
    .slice (0, (props.amount ?? skudatas.length))

  const items = skus.map (sku => (
    <SkudataProvider key={sku} id={sku}>
      <Suspense fallback={<ColorInputFallback />}>
        <ColorInput />
      </Suspense>
    </SkudataProvider>
  ))
  
  return (
    <div className="flex flex-row space-x-2">
      {items}
    </div>
  )
}

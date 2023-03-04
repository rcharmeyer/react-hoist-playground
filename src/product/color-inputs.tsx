import { useProduct, useSkudataBy } from "./data"
import { useSkuSelect } from "./selected-sku"

function ColorInput (props: {
  sku: string,
}) {
  const { sku } = props
  
  const { swatch } = useSkudataBy (sku)
  const { isSelected, onSkuSelect } = useSkuSelect (sku)
  
  let className = "h-6 w-6 object-cover rounded-full ring-offset-2 cursor-pointer"
  
  if (isSelected) className += " ring-1 ring-slate-400"
  else className += " ring-0 hover:ring-1 ring-slate-200"
  
  return <img className={className} src={swatch} onClick={onSkuSelect} />
}

export function ColorInputs (props: {
  amount?: number,
}) {
  const { skudatas } = useProduct()
  
  const content = skudatas
    .map (s => s.id)
    .slice (0, (props.amount ?? skudatas.length))
    .map (sku => <ColorInput key={sku} sku={sku} />)
  
  return <div className="flex flex-row space-x-2">{content}</div>
}

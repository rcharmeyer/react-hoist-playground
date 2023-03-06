import { SkudataIdContext } from "./context"
import { useProduct, useSkudata } from "./data"
import { useSkuSelect } from "./selected-sku"

function ColorInput () {
  const { swatch } = useSkudata ()
  const { isSelected, onSkuSelect } = useSkuSelect ()
  
  let className = "h-6 w-6 object-cover rounded-full ring-offset-2 cursor-pointer"
  
  if (isSelected) className += " ring-1 ring-slate-400"
  else className += " ring-0 hover:ring-1 ring-slate-200"
  
  return <img className={className} src={swatch} onClick={onSkuSelect} />
}

export function ColorInputs (props: {
  amount?: number,
}) {
  const { skudatas } = useProduct()

  const skus = skudatas
    .map (s => s.id)
    .slice (0, (props.amount ?? skudatas.length))
  
  const content = skus.map (sku => (
    <SkudataIdContext.Provider key={sku} value={sku}>
      <ColorInput />
    </SkudataIdContext.Provider>
  ))
  
  return <div className="flex flex-row space-x-2">{content}</div>
}

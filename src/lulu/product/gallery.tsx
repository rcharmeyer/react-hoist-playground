import { hoist } from "../../scope"
import { useSkudataBy } from "./data"
import { ProductScope } from "./product-id"
import { useActiveSku } from "./selected-sku"

const useActiveSkuImage = hoist (() => {
  // useDebugLabel ("useActiveSkuImage")

  const activeSku = useActiveSku ()
  console.log ("active sku", activeSku)
  const { id, image } = useSkudataBy (activeSku)
  console.assert (id === activeSku, "useSkudataBy should respond to the parameter")
  return image
}, [ ProductScope ])

export function Gallery (props: {
  className?: string,
}) {
  const image = useActiveSkuImage ()
  
  let className = "object-contain"
  if (props.className) className += " " + props.className
  
  return <img className={className} src={image} loading="lazy" />
}

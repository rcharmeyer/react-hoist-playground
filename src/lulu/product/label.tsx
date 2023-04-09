import { useProduct } from "./data"

export function ProductLabel (props: {
  small?: boolean,
  className?: string,
}) {
  const { id, name, price } = useProduct ()
  const href = `/product/${id}`
  
  let titleClass = "font-bold text-black"
  let priceClass = "text-sm"
  
  if (! props.small) titleClass += " text-2xl"
  
  return (
    <div className={props.className}>
      <a className={titleClass} href={href}>{name}</a>
      <div className={priceClass}>{price}</div>
    </div>
  )
}

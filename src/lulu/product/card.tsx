import { ColorInputs } from "./color-inputs"
import { Gallery } from "./gallery"
import { ProductLabel } from "./label"

export function ProductCard () {
  let innerClass = "p-2 space-y-2"
  innerClass += " flex flex-col items-center"
  innerClass += " border border-slate-200 border-t-0 rounded-b-xl"

  return (
    <div className="w-36">
      <Gallery className="rounded-t-xl" />
      <div className={innerClass}>
        <ColorInputs amount={3} />
        <ProductLabel className="text-center" small />
      </div>
    </div>
  )
}

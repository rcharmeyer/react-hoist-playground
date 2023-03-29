import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ColorInputs } from "../product/color-inputs"
import { useSkudataBy } from "../product/data"
import { Gallery } from "../product/gallery"
import { ProductLabel } from "../product/label"
import { useActiveSku } from "../product/selected-sku"

function ColorFieldLabel () {
  const activeSku = useActiveSku ()
  const { name } = useSkudataBy (activeSku)
  
  return (
    <div className="space-x-1">
      <span className="font-bold">Color:</span>
      <span>{name}</span>
    </div>
  )
}

function ColorField () {
  return (
    <div className="space-y-1">
      <ColorFieldLabel />
      <ColorInputs />
    </div>
  )
}

export function MainSection () {
  const fallback = <div>{"{product}"}</div>

  const content = (
    <section className="w-full flex flex-row justify-start space-x-8">
      <div>
        <Gallery className="w-60 rounded-xl" />
      </div>
      <div className="space-y-4">
        <Suspense>
          <ProductLabel />
        </Suspense>
        <ColorField />
      </div>
    </section>
  )
  
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense>
        {content}
      </Suspense>
    </ErrorBoundary>
  )
}

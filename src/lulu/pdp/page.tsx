import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { getPageProductId } from "../data/product"
import { MainSection } from "./main-section"
import { ProductProvider } from "../product/product-id"
import { RecommenderSection } from "./recommendations"

export function ProductPage () {
  const recommendationsFallback = <div>{"{recommendations}"}</div>

  return (
    <ProductProvider id={getPageProductId()}>
      <article className="flex flex-col items-center">
        <div className="w-fit space-y-8">
          <MainSection />
          <ErrorBoundary fallback={recommendationsFallback}>
            <Suspense>
              <RecommenderSection />
            </Suspense>
          </ErrorBoundary>
        </div>
      </article>
    </ProductProvider>
  )
}

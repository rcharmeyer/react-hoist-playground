import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { getPageProductId } from "../data/product"
import { ProductIdContext } from "./context"
import { MainSection } from "./main-section"
import { RecommenderSection } from "./recommendations"

export function ProductPage () {
  const recommendationsFallback = <div>{"{recommendations}"}</div>

  return (
    <ProductIdContext.Provider value={getPageProductId()}>
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
    </ProductIdContext.Provider>
  )
}

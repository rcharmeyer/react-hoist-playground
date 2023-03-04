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
      <article className="space-y-8 flex flex-col items-center">
        <MainSection />
        <ErrorBoundary fallback={recommendationsFallback}>
          <Suspense>
            <RecommenderSection />
          </Suspense>
        </ErrorBoundary>
      </article>
    </ProductIdContext.Provider>
  )
}

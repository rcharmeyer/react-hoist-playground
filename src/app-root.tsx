import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ProductPage } from "./product"

export function App () {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense>
        <ProductPage />
      </Suspense>
    </ErrorBoundary>
  )
}

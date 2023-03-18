import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ProductPage } from "./product"
import { Tip, TipRoot } from "./tips"

const Page = () => <TipRoot id="1" /> // ProductPage

export function App () {
  return (
    <ErrorBoundary fallback={null}>
      <Suspense>
        <Page />
      </Suspense>
    </ErrorBoundary>
  )
}

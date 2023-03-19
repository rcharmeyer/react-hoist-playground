import { ComponentType, Suspense, useMemo } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ProductPage } from "./product"
import { TipExample } from "./tips"

function matchPath (options: Record <string, ComponentType>) {
  const { pathname } = window.location
  let [ , path ] = pathname.split ("/")
  path ||= ""

  if (! options [path]) throw new Error ("No component found for path")
  return options [path]
}

function Navbar () {
  return (
    <nav className="border-b w-full p-4 flex flex-row space-x-8">
      <span>Examples:</span>
      <a href="/">Recursive Tooltip</a>
      <a href="/product">Product Page</a>
    </nav>
  )
}

export function App () {
  const Page = useMemo (() => matchPath ({
    "": TipExample,
    "product": ProductPage,
  }), [])

  return (
    <ErrorBoundary fallback={null}>
      <Suspense>
        <div className="w-full space-y-8">
          <Navbar />
          <Page />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}

import { ComponentType, lazy, Suspense, useMemo } from "react"
import { ErrorBoundary } from "react-error-boundary"

const CounterExample = lazy (() => import ("./counter"))
const TipExample = lazy (() => import ("./tips"))

const ProductPage = lazy (() => import ("./lulu/pdp"))
const SearchPage = lazy (() => import ("./lulu/search"))

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
      <a href="/">Counter</a>
      <a href="/tooltips">Recursive Tooltip</a>
      <a href="/product">Product Page</a>
      <a href="/search">Product Search</a>
    </nav>
  )
}

export function App () {
  const Page = useMemo (() => matchPath ({
    "": CounterExample,
    "tooltips": TipExample,
    "product": ProductPage,
    "search": SearchPage,
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

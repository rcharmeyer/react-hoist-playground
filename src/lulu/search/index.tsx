import { createLoader } from "@rcharmeyer/react-utils"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { fetchProductsByLengths } from "../data/product"
import { ProductCard } from "../product/card"
import { ProductProvider } from "../product/product-id"
import { useActiveFilters } from "./filter"
import { FilterButton } from "./filter-button"

const useSearchByLengths = createLoader (async (lengths: string[]) => {
  const products = await fetchProductsByLengths (lengths)
  return products.map (p => p.id)
})

function SearchResults () {
  const lengths = useActiveFilters ()
  const ids = useSearchByLengths (lengths)
  
  return (
    <main>
      {ids.map (id => (
        <ProductProvider id={id}>
          <ProductCard />
        </ProductProvider>
      ))}
    </main>
  )
}

const LENGTHS = [ '25"', '28"', '31"' ]

const LengthFilters = () => (
  <div className="flex flex-row items-center justify-center space-x-4">
    <h3>Filter by Length</h3>
    {LENGTHS.map (length => (
      <FilterButton filter={length} />
    ))}
  </div>
)

const SearchResultsFallback = () => <div>Loading...</div>

const SearchPage = () => (
  <article>
    <Suspense>
      <LengthFilters />
    </Suspense>
    <ErrorBoundary fallback={<SearchResultsFallback />}>
      <Suspense>
        <SearchResults />
      </Suspense>
    </ErrorBoundary>
  </article>
)

export default SearchPage
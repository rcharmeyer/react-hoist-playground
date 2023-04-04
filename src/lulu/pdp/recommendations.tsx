import { fetchRecommendationsById } from "../data/product"
import { makeAsync } from "../../lib/hooks"
import { hoist, useStore } from "@rcharmeyer/react-utils"
import { ProductCard } from "../product/card"
import { useProductId, ProductProvider, ProductScope } from "../product/product-id"
import { Suspense } from "react"

const useRecommendationsById = makeAsync (fetchRecommendationsById)

const useProductRecommendations = hoist (() => {
  const pid = useProductId ()
  const res = useRecommendationsById (pid)
  console.assert (!!res?.length, "res?.length")
  return res
}, [ ProductScope ])

export function RecommenderSection () {
  const recs = useProductRecommendations ()

  return (
    <section className="flex flex-row space-x-8">
      {(recs || []).map ((rec) => (
        <ProductProvider key={rec} id={rec}>
          <ProductCard />
        </ProductProvider>
      ))}
    </section>
  )
}

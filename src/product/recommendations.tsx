import { useContext } from "react"
import { fetchRecommendationsById } from "../data/product"
import { hoist } from "../hoist"
import { makeAsync } from "../hooks"
import { ProductCard } from "./card"
import { ProductIdContext } from "./context"

const useRecommendationsById = makeAsync (fetchRecommendationsById)

const useProductRecommendations = hoist (() => {
  const pid = useContext (ProductIdContext)
  const res = useRecommendationsById (pid)
  console.assert (!!res?.length, "res?.length")
  return res
})

export function RecommenderSection () {
  const recs = useProductRecommendations ()

  return (
    <section className="flex flex-row space-x-8">
      {(recs || []).map ((rec) => (
        <ProductIdContext.Provider key={rec} value={rec}>
          <ProductCard />
        </ProductIdContext.Provider>
      ))}
    </section>
  )
}

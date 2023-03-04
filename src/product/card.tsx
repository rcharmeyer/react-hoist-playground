import { Suspense, useContext, useMemo, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { fetchProductById, fetchRecommendationsById, getPageProductId, PRODUCTS, Skudata } from "../data/product"
import { hoist, useDebugLabel } from "../hoist"
import { makeAsync, useEvent } from "../hooks"
import { ProductIdContext } from "./context"

const useProductDataById = makeAsync (fetchProductById)
// const useProductDataById = getProductById

// everything is returning undefined
const useProduct = hoist (() => {
  console.group ("[useProduct]")
  
  try {
    const pid = useContext (ProductIdContext)
    console.log ("pid =", pid)
    useDebugLabel (`useProduct`)
    
    const res = useProductDataById (pid)
    console.log ("returns", res)
    console.assert (!!res, "expected product data")
    
    return res // ?? getProductById (pid)
  }
  finally {
    console.groupEnd ()
  }
})

// no idea why this works but if I wrap this in hoist it doesn't

const useSkudataBy = hoist ((sku: string) => {
  console.log ("[useSkudataBy]", sku)
  useDebugLabel (`useSkudataBy?sku=${sku}`)
  
  // const pid = useContext (ProductIdContext)
  const { skudatas } = useProduct()
  
  return useMemo (() => {
    const res = skudatas.find (s => s.id === sku)
    return res as Skudata
  }, [ sku ])
})

const useSelectedSkuState = hoist (() => {
  useContext (ProductIdContext)
  useDebugLabel (`useSelectedSkuState`)
  
  const [ selectedSku, setSelectedSku ] = useState ("")
  return { selectedSku, setSelectedSku }
})

const useActiveSku = hoist (() => {
  useDebugLabel ("useActiveSku")
  
  const { skudatas } = useProduct()
  const { selectedSku } = useSelectedSkuState ()
  console.log ("selectedSku", selectedSku)
  
  const defaultSku = useMemo (() => {
    console.assert (!!skudatas.length)
    return skudatas[0].id
  }, [ skudatas ])
  
  const res = selectedSku || defaultSku
  // useDebugValue (res)
  console.assert (!!res)
  return res
})

const useSkuSelect = hoist ((sku: string) => {
  useDebugLabel ("useSkuSelect")
  const { selectedSku, setSelectedSku } = useSelectedSkuState ()
  const isSelected = sku === selectedSku
  
  const onSkuSelect = useEvent (() => {
    setSelectedSku (sku)
  })
  
  return { isSelected, onSkuSelect }
})

const useActiveSkuImage = hoist (() => {
  useDebugLabel ("useActiveSkuImage")
  const activeSku = useActiveSku ()
  console.log ("active sku", activeSku)
  const { id, image } = useSkudataBy (activeSku)
  console.assert (id === activeSku, "useSkudataBy should respond to the parameter")
  return image
})

function Gallery (props: {
  className?: string,
}) {
  // const activeSku = useActiveSku ()
  // const { image } = useSkudataBy (activeSku)
  const image = useActiveSkuImage ()
  
  let className = "object-contain"
  if (props.className) className += " " + props.className
  
  return <img className={className} src={image} />
}

function ColorInput (props: {
  sku: string,
}) {
  const { sku } = props
  
  const { swatch } = useSkudataBy (sku)
  const { isSelected, onSkuSelect } = useSkuSelect (sku)
  
  let className = "h-6 w-6 object-cover rounded-full ring-offset-2 cursor-pointer"
  
  if (isSelected) className += " ring-1 ring-slate-400"
  else className += " ring-0 hover:ring-1 ring-slate-200"
  
  return <img className={className} src={swatch} onClick={onSkuSelect} />
}

function ColorInputs (props: {
  amount?: number,
}) {
  const { skudatas } = useProduct()
  
  const content = skudatas
    .map (s => s.id)
    .slice (0, (props.amount ?? skudatas.length))
    .map (sku => <ColorInput key={sku} sku={sku} />)
  
  return <div className="flex flex-row space-x-2">{content}</div>
}

function ColorFieldLabel () {
  const activeSku = useActiveSku ()
  const { name } = useSkudataBy (activeSku)
  
  return (
    <div className="space-x-1">
      <span className="font-bold">Color:</span>
      <span>{name}</span>
    </div>
  )
}

function ColorField () {
  return (
    <div className="space-y-1">
      <ColorFieldLabel />
      <ColorInputs />
    </div>
  )
}

function ProductLabel (props: {
  className?: string,
}) {  
  const { id, name, price } = useProduct ()
  const href = `/product/${id}`

  let titleClass = "font-bold text-black"
  let priceClass = "text-sm"
  if (props.fullName) titleClass += " text-2xl"
  
  return (
    <div className={props.className}>
      <a className={titleClass} href={href}>{name}</a>
      <div className={priceClass}>{price}</div>
    </div>
  )
}

export function ProductCard () {
  let innerClass = "p-2 space-y-2"
  innerClass += " flex flex-col items-center"
  innerClass += " border border-slate-200 border-t-0 rounded-b-xl"

  return (
    <div className="w-36">
      <Gallery className="rounded-t-xl" />
      <div className={innerClass}>
        <ColorInputs amount={3} />
        <ProductLabel className="text-center" />
      </div>
    </div>
  )
}

const useRecommendationsById = makeAsync (fetchRecommendationsById)

const useProductRecommendations = hoist (() => {
  const pid = useContext (ProductIdContext)
  const res = useRecommendationsById (pid)
  console.assert (!!res?.length, "res?.length")
  return res
})

function RecommenderSection () {
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

function MainSection () {
  const fallback = <div>{"{product}"}</div>

  const content = (
    <section className="w-full flex flex-row justify-start space-x-8">
      <div>
        <Gallery className="w-60 rounded-xl" />
      </div>
      <div className="space-y-4">
        <Suspense>
          <ProductLabel fullName />
        </Suspense>
        <ColorField />
      </div>
    </section>
  )
  
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense>
        {content}
      </Suspense>
    </ErrorBoundary>
  )
}

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

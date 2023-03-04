import { Suspense, useContext, useDebugValue, useMemo, useRef, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { fetchProductById, getProductById, Product, Skudata } from "../data/product"
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
    
    let className = "h-6 w-6 object-cover rounded-full ring-offset-2"
    
    if (isSelected) className += " ring-1 ring-slate-400"
    else className += " ring-0 hover:ring-1 ring-slate-200"
    
    return <img className={className} src={swatch} onClick={onSkuSelect} />
}

function ColorInputs () {
    const { skudatas } = useProduct()
    
    const content = skudatas
        .map (s => s.id)
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
    const ref = useRef (false)
    
    const pid = useContext (ProductIdContext)
    console.group ("[ProductLabel]", pid, labelsRendered++)
    
    if (!ref.current) {
        ref.current = true
        console.log ("initializing ProductLabel")
    }
    
    let product: Product
    try {
        // product = useProduct ()
        product = useProduct ()
        // product = useProductDataById (pid)
        console.log (product)
    }
    catch (e) {
        console.log ("caught", e)
        if (e instanceof Promise) {
            console.assert (e.status === "pending", "e.status === 'pending'")
        }
        throw e
    }
    finally {
        console.groupEnd ()
    }
    
    console.log ('rendering')
    
    const { name, price } = product
    
    return (
        <div className={props.className}>
            <div className="font-bold">{name}</div>
            <div>{price}</div>
        </div>
    )
}

export function ProductCard () {
    let innerClass = "p-2 space-y-2"
    innerClass += " border border-slate-200 border-t-0 rounded-b-xl"
        
    return (
        <div className="w-60">
            <Gallery className="rounded-t-xl" />
            <div className={innerClass}>
                <ColorInputs />
                <ProductLabel className="text-center" />
            </div>
        </div>
    )
}

const RECS = [
    "align-25",
    "align-25",
]

function RecommenderSection () {
    return (
        <section className="flex flex-row space-x-8">
            {RECS.map ((rec) => (
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
        <section className="flex flex-row space-between space-x-8">
            <div className="w-60">
                <Gallery className="h-40 rounded-xl" />
            </div>
            <div className="w-60 p-2 space-y-4">
                <Suspense>
                    <ProductLabel />
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
    return (
        <ProductIdContext.Provider value="align-25">
            <article className="w-full space-y-8 flex flex-col items-center">
                <MainSection />
                <Suspense>
                    <RecommenderSection />
                </Suspense>
            </article>
        </ProductIdContext.Provider>
    )
}
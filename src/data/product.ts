import { memoize } from "lodash-es"

const URL = `https://images.lululemon.com/is/image/lululemon`
const QS = "fit=crop,1&op_usm=0.8,1,10,0&fmt=webp&qlt=90,1&op_sharpen=0&resMode=sharp2&iccEmbed=0&printRes=72"
const swatchUrl = (code: string) => `${URL}/${code}?wid=34&hei=34&${QS}`
const galleryUrl = (code: string) => `${URL}/${code}?wid=320&${QS}`

export type Skudata = {
    id: string,
    name: string,
    image: string,
    swatch: string
}

export type Product = {
    id: string,
    name: string,
    price: string,
    skudatas: Skudata[]
}

export const PRODUCTS = [] as Product[]

async function delay (ms: number) {
    return new Promise <void> ((resolve) => {
        setTimeout (() => resolve (), ms)
    })
}

export const getProductById = (id: string) => {
    console.log ("getting product data")
    const res = PRODUCTS.find (p => p.id === id)
    return res as Product
}

export const fetchProductById = async (id: string) => {
    console.log ("fetching product data")
    return getProductById (id)
}

PRODUCTS.push ({
    id: "align-25",
    name: "Align™ High-Rise Pant 25\"",
    price: "$98 - $118",
    skudatas: [],
})

PRODUCTS[0].skudatas.push ({
    id: "align-25--solar-orange",
    name: "Solar Orange",
    swatch: swatchUrl ("34975"),
    image: galleryUrl ("LW5CTCS_034975_1"),
})

PRODUCTS[0].skudatas.push ({
    id: "align-25--delicate-mint",
    name: "Solar Orange",
    swatch: swatchUrl ("46741"),
    image: galleryUrl ("LW5CTCS_046741_1"),
})

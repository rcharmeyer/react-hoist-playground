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
  length: string,
  skudatas: Skudata[]
}

export const PRODUCTS = [] as Product[]

export function getPageProductId () {
  const url = window.location.href
  const parts = url.split ("/")
  const id = parts[parts.length - 1]

  if (PRODUCTS.find (p => p.id === id)) return id
  return PRODUCTS[0].id
}


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
  await delay (100)
  console.log ("fetching product data")
  return getProductById (id)
}



PRODUCTS.push ({
  id: "align-25",
  name: "Align™ Pant 25\"",
  price: "$98 - $118",
  length: '25"',
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
  name: "Delicate Mint",
  swatch: swatchUrl ("46741"),
  image: galleryUrl ("LW5CTCS_046741_1"),
})

PRODUCTS[0].skudatas.push ({
  id: "align-25--grey-sage",
  name: "Heathered Grey Sage",
  swatch: swatchUrl ("37338"),
  image: galleryUrl ("LW5CZOS_037338_1"),
})

PRODUCTS[0].skudatas.push ({
  id: "align-25--dusty-clay",
  name: "Dusty Clay",
  swatch: swatchUrl ("52871"),
  image: galleryUrl ("LW5CTCS_052871_1"),
})



PRODUCTS.push ({
  id: "align-28",
  name: "Align™ Pant 28\"",
  price: "$98 - $118",
  length: '28"',
  skudatas: [],
})

PRODUCTS[1].skudatas.push ({
  id: "align-28--bone",
  name: "Bone",
  swatch: swatchUrl ("27597"),
  image: galleryUrl ("LW5CTIS_027597_1"),
})

PRODUCTS[1].skudatas.push ({
  id: "align-28--velvet-dust",
  name: "Velvet Dust",
  swatch: swatchUrl ("29847"),
  image: galleryUrl ("LW5DITS_029847_1"),
})

PRODUCTS[1].skudatas.push ({
  id: "align-28--dusty-clay",
  name: "Dusty Clay",
  swatch: swatchUrl ("52871"),
  image: galleryUrl ("LW5CTIS_052871_1"),
})

PRODUCTS[1].skudatas.push ({
  id: "align-28--carnation-red",
  name: "Carnation Red",
  swatch: swatchUrl ("44634"),
  image: galleryUrl ("LW5ECIS_044634_1"),
})

PRODUCTS[1].skudatas.push ({
  id: "align-28--emboss-black",
  name: "Ripple Emboss Black",
  swatch: swatchUrl ("60846"),
  image: galleryUrl ("LW5DVHS_060846_1"),
})



PRODUCTS.push ({
  id: "align-31",
  name: "Align™ Pant 31\"",
  price: "$98 - $118",
  length: '31"',
  skudatas: [],
})

PRODUCTS[2].skudatas.push ({
  id: "align-31--pink-peony",
  name: "Pink Peony",
  swatch: swatchUrl ("56496"),
  image: galleryUrl ("LW5CTLT_056496_1"),
})

PRODUCTS[2].skudatas.push ({
  id: "align-31--dark-olive",
  name: "Dark Olive",
  swatch: swatchUrl ("26083"),
  image: galleryUrl ("LW5CTJT_026083_1"),
})

PRODUCTS[2].skudatas.push ({
  id: "align-31--red-merlot",
  name: "Red Merlot",
  swatch: swatchUrl ("47809"),
  image: galleryUrl ("LW5CTJT_047809_1"),
})

PRODUCTS[2].skudatas.push ({
  id: "align-31--true-navy",
  name: "True Navy",
  swatch: swatchUrl ("31382"),
  image: galleryUrl ("LW5DQPT_031382_1"),
})



// RECOMMENDATIONS

const PRODUCT_RECS = {} as Record <string, string[]>

export async function fetchRecommendationsById (id: string) {
  console.log ("fetching product data")
  const res = PRODUCT_RECS[id]
  return res as string[]
}

const len = PRODUCTS.length
for (let i = 0; i < len; i++) {
  const pid = PRODUCTS[i].id
  PRODUCT_RECS [pid] = [ pid ]
  for (let j = 0; j < len; j++) {
    if (i === j) continue
    PRODUCT_RECS [pid].push (PRODUCTS[j].id)
  }
}



// SEARCH

export async function fetchProductsByLengths (lengths: string[]) {
  if (!lengths.length) return PRODUCTS
  const products = PRODUCTS
    .filter (p => lengths.includes (p.length))
  return products
}

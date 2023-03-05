import { memoize } from "lodash-es"
import { ComponentType, memo } from "react"
import { withHoistable } from "./hoist"

const createElement = globalThis.React.createElement

// to prevent infite loops
let n = 0

setInterval (() => {
  if (n > 0) console.log ("createElement counter has been reset")
  n = 0
}, 4000)

const withMemo = memoize (memo)

let ignoreNext = false

function applyWithMemo (component: ComponentType<any>) {
  if (ignoreNext) {
    ignoreNext = false
  }
  else if (component.$$typeof !== Symbol.for ("react.memo")) {
    ignoreNext = true
    component = withMemo (component)
  }
  return component
}

function applyWithHoistable (component: ComponentType<any>, __ignoreJsxMiddleware: boolean) {
  if (! component._context) return component
  if (__ignoreJsxMiddleware) return component
  return withHoistable (component)
}

globalThis.React.createElement = (type, props, ...children) => {
  const { __ignoreJsxMiddleware, ...rest } = props ?? {}
  if (props) props = rest

  // return createElement (type, ...args)
  if (n++ > 1000) throw new Error ("too many createElement calls (1000 limit)")
  console.group ("[createElement]", n)

  try {
    if (type && typeof type === "object") {
      type = applyWithHoistable (type, __ignoreJsxMiddleware)
      type = applyWithMemo (type)
    }

    console.log (type)
    console.log (props)
    console.group ("children:")
    for (const child of children) {
      console.log (child)
    }
    console.groupEnd()

    return createElement (type, props, ...children)
  }
  finally {
    console.groupEnd ()
  }
}

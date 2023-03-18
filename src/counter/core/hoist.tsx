import { createContext, PropsWithChildren, useContext, useState } from "react"
import { hoist } from "../../hoist"

const CounterContext = createContext (0)

export const useCounterState = hoist (() => {
  const initialCount = useContext (CounterContext)
  const [count, setCount] = useState (initialCount)
  return { count, setCount }
})

export function CounterProvider (props: PropsWithChildren <{ initial: number }>) {
  return (
    <CounterContext.Provider value={props.initial}>
      {props.children}
    </CounterContext.Provider>
  )
}

import * as MoleculesVariant from "./molecules"
import * as HoistVariant from "./hoist"

export const inHoistMode = () => !!window.location.pathname.includes("hoist")

export const useCounterState: typeof HoistVariant.useCounterState = (...args) => {
  const hook = inHoistMode () 
    ? HoistVariant.useCounterState 
    : MoleculesVariant.useCounterState
  return hook (...args)
}

export const CounterProvider: typeof HoistVariant.CounterProvider = (props) => {
  const Provider = inHoistMode () 
    ? HoistVariant.CounterProvider 
    : MoleculesVariant.CounterProvider
  return <Provider {...props} />
}

import { Suspense, useState } from "react"
import { useValueShallow } from "../hooks"
import { createScope, createStore, useStore } from "../scope"

const CounterScope = createScope ()

const countStore = createStore (() => {
  console.log ("countStore")
  const [ count, setCount ] = useState (0)
  return useValueShallow ({ count, setCount })
}, [ CounterScope ])

const useCountState = () => useStore (countStore)

function Button (props: {
  text: string, 
  onClick: () => void, 
}) {
  return (
    <button type="button" onClick={props.onClick}>{props.text}</button>
  )
}

function Counter () {
  const { count, setCount } = useCountState ()
  return (
    <div>
      <Button text="-" onClick={() => setCount (count - 1)} />
      <span>{count}</span>
      <Button text="+" onClick={() => setCount (count + 1)} />
    </div>
  )
}

export default function CounterExample () {
  return (
    <Suspense>
      <CounterScope>
        <Counter />
        <Counter />
      </CounterScope>
    </Suspense>
  )
}

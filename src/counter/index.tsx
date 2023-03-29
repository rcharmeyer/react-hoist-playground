import { Suspense, useState } from "react"
import { useValueShallow } from "../lib/hooks"
import { createScope, createStore, useStore } from "../lib/scope"

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
    <button
      className="w-4 p-0 leading-none" 
      type="button" 
      onClick={props.onClick}
    >
      {props.text}
    </button>
  )
}

function Counter () {
  const { count, setCount } = useCountState ()
  return (
    <div className="border rounded-lg w-20 p-2 flex flex-row justify-between items-center">
      <Button text="-" onClick={() => setCount (count - 1)} />
      <span>{count}</span>
      <Button text="+" onClick={() => setCount (count + 1)} />
    </div>
  )
}

export default function CounterExample () {
  return (
    <Suspense>
      <div className="flex flex-col items-center">
        <CounterScope>
          <h2>These share state</h2>
          <div className="flex flex-row space-x-4">
            <Counter />
            <Counter />
          </div>
          <br />
          <h2>This one does not share state</h2>
          <CounterScope>
            <Counter />
          </CounterScope>
        </CounterScope>
      </div>
    </Suspense>
  )
}

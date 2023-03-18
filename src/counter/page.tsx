import { PropsWithChildren } from "react"
import { CounterProvider, inHoistMode, useCounterState } from "./core"

function Counter () {
  const { count, setCount } = useCounterState ()
  return (
    <div>
      {count} <button onClick={() => setCount (count + 1)}>+1</button>
    </div>
  )
}

function CounterGroup (props: PropsWithChildren <{
  title: string,
  value?: number,
}>) {
  const content = (
    <div className="border-l-2 pl-4 mt-2">
      <h3>{props.title}</h3>
      <Counter />
      <Counter />
      {props.children}
    </div>
  )
  
  if (typeof props.value !== "number") return content
  return (
    <CounterProvider initial={props.value}>
      {content}
    </CounterProvider>
  )
}

const SimpleApp = () => (
  <div>
    <CounterGroup value={1} title="With initial value 1" />
    <CounterGroup value={2} title="With initial value 2" />
    <CounterGroup title="Default"/>
  </div>
)

const ComplexApp = () => (
  <div>
    <CounterGroup value={1} title="With initial value 1" />
    <CounterGroup value={1} title="Another with initial value 1" />
    <CounterGroup value={2} title="With initial value 2 and children">
      <CounterGroup value={1} title="Nested with initial value 1" />
      <CounterGroup value={2} title="Nested With initial value 2" />
      <CounterGroup value={3} title="Nested With initial value 3" />
    </CounterGroup>
    <CounterGroup title="Default"/>
  </div>
);

const inComplexMode = () => !!window.location.pathname.includes("complex")
const getName = () => {
  let name = `Example`
  
  if (inHoistMode()) name = `Hoist ${name}`
  else name = `Molecule ${name}`

  if (inComplexMode()) name = `Complex ${name}`
  else name = `Simple ${name}`

  return name
}

export const App = () => (
  <article>
    <h1>{getName()}</h1>
    <table>
      <tr>
        <td className="p-2">
          <a href="/">Simple Molecule Example</a>
        </td>
        <td className="p-2">
          <a href="/hoist">Simple Hoist Example</a>
        </td>
      </tr>
      <tr>
        <td className="p-2">
          <a href="/complex">Complex Molecule Example</a>
        </td>
        <td className="p-2">
          <a href="/hoist-complex">Complex Hoist Example</a>
        </td>
      </tr>
    </table>
    {inComplexMode() ? <ComplexApp /> : <SimpleApp />}
  </article>
)

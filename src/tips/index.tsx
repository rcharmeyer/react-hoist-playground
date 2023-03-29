import { createContext, PropsWithChildren, Suspense, useContext, useState } from "react";
import { makeAsync } from "../hooks";
import { createScope, createStore, useStore } from "../scope";

type TipData = {
  title: string,
  body: string,
  subtipIds: string[],
}

async function fetchTipData (id: string): Promise <TipData> {
  if (id === "1") {
    return {
      title: "Tip 1",
      body: "This is the body for tip #1",
      subtipIds: ["2", "3", "4"],
    }
  }
  if (id === "2") {
    return {
      title: "Tip 2",
      body: "This is the body for tip #2",
      subtipIds: ["1", "3", "4"],
    }
  }
  if (id === "3") {
    return {
      title: "Tip 3",
      body: "This is the body for tip #3",
      subtipIds: ["1", "2", "4"],
    }
  }
  if (id === "4") {
    return {
      title: "Tip 4",
      body: "This is the body for tip #4",
      subtipIds: ["1", "2", "3"],
    }
  }

  throw new Error ("Not found")
}

const TipIdContext = createContext ("")
const TipScope = createScope ()
const MiscScope = createScope ()

function TipProvider (props: PropsWithChildren <{ id: string }>) {
  return (
    <TipIdContext.Provider value={props.id}>
      <TipScope key={props.id}>
        {props.children}
      </TipScope>
    </TipIdContext.Provider>
  )
}

const useTipData = makeAsync (fetchTipData)

const selectedTipStore = createStore (() => {
  useContext (TipIdContext)
  const [ selectedTipId, setSelectedTipId ] = useState ("")
  return { selectedTipId, setSelectedTipId }
}, [ TipScope ])

function Subtip (props: { id: string }) {
  const { title } = useTipData (props.id)
  const { selectedTipId, setSelectedTipId } = useStore (selectedTipStore)
  const isSelected = props.id === selectedTipId

  const onClick = () => setSelectedTipId (props.id)

  let className = ""
  if (isSelected) className += " border-2 border-blue-500 font-semibold"

  return (
    <button type="button" { ...{ className, onClick }}>
      {title}
    </button>
  )
}

function ExpandedSubtip () {
  const { selectedTipId } = useStore (selectedTipStore)

  if (!selectedTipId) return null
  return (
    <Suspense>
      <TipProvider id={selectedTipId}>
        <Tip />
      </TipProvider>
    </Suspense>
  )
}

export function Tip (props: { root?: boolean }) {
  const id = useContext (TipIdContext)
  const { title, body, subtipIds } = useTipData (id)

  return (
    <div className="space-y-4">
      {!!props.root && <h6 className="text text-center mt-2 font-semibold">{title}</h6>}
      <p className="text-sm text-light">{body}</p>
      <ul className="flex flex-row items-center justify-around">
        {subtipIds.map ((id) => (
          <li key={id}>
            <Subtip id={id} />
          </li>
        ))}
      </ul>
      <ExpandedSubtip />
    </div>
  )
}

function TipRoot (props: { id: string }) {
  return (
    <div className="border rounded-lg px-2 pb-2 space-y-4 w-72">
      <TipProvider id={props.id}>
        <Tip root />
      </TipProvider>
    </div>
  )
}

export default function TipExample () {
  return (
    <article className="flex flex-col items-center justify-center">
      <TipRoot id="1" />
    </article>
  )
}

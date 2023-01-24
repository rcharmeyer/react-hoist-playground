import { atom } from "jotai"
import { atomFamily } from "jotai/utils"
import { useContext, useRef } from "react"
import { Counter } from "./Counter"
import { TECH_BY_ID } from "./data/techs"
import { hoist, useDebugLabel, useJotaiValue } from "./hoist"
import { TechIdContext } from "./TechIdContext"

/*
function useAssertMetaContext (context: Context<any>) {
    const metasymbol = useMetasymbolContext()
    const metasymbols = getMetasymbolAncestors (metasymbol)
    
    const scope = metasymbols.find (s => context === getMetasymbolContext (s))
    const foundContext = getMetasymbolContext (scope)
    
    console.assert (context === foundContext, "[useAssertMetaContext]")
}

function useAssertMetaContextValue (context: Context<any>) {
    const value = useContext (context)
    const metasymbol = useMetasymbolContext()
    const metasymbols = getMetasymbolAncestors (metasymbol)
    
    const scope = metasymbols.find (s => context === getMetasymbolContext (s))
    const foundValue = useAtomValue (atomsByMetasymbol (scope))
    
    console.assert (value === foundValue, `[useAssertMetaContextValue] ${value} === ${foundValue}`)
}
*/

async function delay (ms: number) {
    return new Promise <void> ((resolve) => {
        setTimeout (() => resolve (), ms)
    })
}

async function getTechById (id: string) {
    await delay (100)
    return TECH_BY_ID [id]
}

const techAtomById = atomFamily ((id: string) => atom (async () => {
    return await getTechById (id)
}))

const useTechAtomById = hoist ((id: string) => {
    useDebugLabel (`useTechAtomById (${id})`)
    const techAtom = techAtomById (id)
    return useJotaiValue (techAtom)
})

function TechLogo () {
    const id = useContext (TechIdContext)
    const tech = useTechAtomById (id)
    
    if (!tech) return null
    
    const {
        href,
        src,
        className,
        alt,
    } = tech
    
    return (
        <a {...{ href }} target="_blank">
            <img {...{ src, className, alt }} />
        </a>
    )
}

export function TechCard () {
    let className = "flex flex-col items-center justify-between h-48 w-48 p-4"
    className += " border border-slate-200 rounded-lg"
    
    return (
        <div className={className}>
            <TechLogo />
            <Counter />
        </div>
    )
}
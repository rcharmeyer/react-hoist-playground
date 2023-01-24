import { useEffect, useState } from "react";
import { hoist, useDebugLabel } from "./hoist"
import { useKeyContext, useEvent } from "./hooks";
import { TechIdContext } from "./TechIdContext";

const useCountState = hoist (() => {
    useDebugLabel (`useCountState`)
    const id = useKeyContext (TechIdContext)
    const [ count, setCount ] = useState (0)
    const displayCount = `${id} = ${count}`
    
    useEffect (() => {
        console.log ("[useCountState] effect displayCount")
        return () => {
            console.log ("[useCountState] unmount displayCount")
        }
    }, [ displayCount ])
    
    return { displayCount, count, setCount }
})

const useCategoryStates = hoist ((category: string) => {
    useDebugLabel (`useCategoryStates(category: ${category})`)
    const { count, setCount, displayCount: display } = useCountState ()
    const [ clicked, setClicked ] = useState (false)
    const displayCount = category
        ? `${category} = ${count}`
        : display
    
    const onClick = useEvent (() => {
        setClicked (true)
        setCount(count + 1)
    })
    
    useEffect (() => {
        console.log ("[useCategoryState] effect displayCount")
        return () => {
            console.log ("[useCategoryState] unmount displayCount")
        }
    }, [ displayCount ])
    
    return {
        // count,
        // setCount,
        displayCount,
        clicked,
        onClick,
    }
})

export function Counter (props: { border?: boolean, category?: string }) {
    const { displayCount, clicked, onClick } = useCategoryStates (props.category)
    
    useEffect (() => {
        console.log ("[Counter] effect displayCount")
        return () => {
            console.log ("[Counter] unmount displayCount")
        }
    }, [ displayCount ])
    // console.log ("post useCountState", count)
    
    /*
    const onClick = () => {
        console.log ("about to setCount", count)
        setCount(count + 1)
    }
    */
    
    let className = "flex flex-col items-center justify-center w-48 p-4"
    if (props.border) className += " border rounded-lg"
    if (clicked) className += " border-rose-500"
    else className += " border-slate-200"
    
    return (
        <div className={className}>
            <button onClick={onClick}>
                {displayCount}
            </button>
        </div>
    )
}
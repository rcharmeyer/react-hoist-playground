import { Context, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Func } from "../types"

export { makeAsyncByKey } from "./use-async"

function funcWrap <T extends Func> (getFunc: () => T) {
  const res: Func = (...args: Parameters <T>) => {
    const func = getFunc()
    return func (...args)
  }
  return res as T
}

export function useEvent <T extends Func> (callback: T): T {
  const ref = useRef (callback)
  ref.current = callback
  
  const wrappedCallback = funcWrap (() => ref.current)
  return useCallback (wrappedCallback, [])
}

export function useRerender () {
  const [ count, setCount ] = useState (0)
  return useEvent (() => {
    setCount (count + 1)
  })
}

export function useMounted () {
    const [mounted, setMounted] = useState (false)
    
    useEffect (() => {
        setMounted (true)
        return () => {
            setMounted (false)
        }
    }, [])
    
    return mounted
}

export function useAssertConstant (val: any, msg: string) {
    const mounted = useMounted()
    
    useEffect (() => {
        if (mounted) {
            console.error (`[useAssertConstant] ${msg}`)
        }
    }, [ val ])
}

export function usePrevious (val: any) {
    const ref = useRef ()
    const res = ref.current
    ref.current = val
    return res
}

export function useKeyContext (context: Context <any>) {
    const id = useContext (context)
    // const mounted = useMounted ()
    const prevId = usePrevious (id)
    
    if (prevId && prevId !== id) {
        throw new Error (`[CountStore] changed to ${id} from ${prevId}`)
    }
    
    return id
}
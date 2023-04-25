import { createStore, hoist, useEvent, useMemoShallow, useStore, useStruct } from "@rcharmeyer/react-utils"
import { useReducer } from "react"

type Filters = Record <string, boolean|undefined>

function reducer (state: Filters, action: string) {
  return {
    ...state,
    [action]: !state[action],
  }
}

export const filterStore = createStore (() => {
  const [ filters, dispatch ] = useReducer (reducer, {} as Filters)
  
  const toggleFilterByKey = useEvent ((key: string) => {
    dispatch (key)
  })
  
  return useStruct ({ 
    filters, 
    toggleFilterByKey,
  })
}, [])

export function useActiveFilters () {
  const { filters } = useStore (filterStore)
  
  return useMemoShallow (() => {
    const res = Object.entries (filters)
      .filter (([ , val ]) => val)
      .map (([ key ]) => key)
      .sort ()
    return res
  }, [ filters ])
}

export const useFilterStoreBy = hoist ((key: string) => {
  const { filters, toggleFilterByKey } = useStore (filterStore)
  
  const filtered = filters[key]
  
  const toggleFilter = useEvent (() => {
    toggleFilterByKey (key)
  })
  
  return useStruct ({
    filtered,
    toggleFilter,
  })
}, [])

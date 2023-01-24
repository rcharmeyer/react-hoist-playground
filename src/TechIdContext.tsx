import { createContext } from "react"
import { makeContextHoistable } from "./hoist/metasymbols"

export const TechIdContext = createContext ("")
TechIdContext.displayName = "TechIdContext"
makeContextHoistable (TechIdContext)
import { createContext } from "react";
import { makeContextHoistable } from "../hoist/metasymbols";

export const ProductIdContext = createContext ("")
ProductIdContext.displayName = "ProductIdContext"
makeContextHoistable (ProductIdContext)

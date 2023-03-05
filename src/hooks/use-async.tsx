import { Fanc } from "../types";
import { readPromise } from "../hoist";
import { memoize } from "lodash-es";

export function makeAsync <T extends Fanc> (func: T) {
  const memoized = memoize (func)
  return (...args: Parameters <T>) => {
    const res = readPromise (memoized (...args)) 
    return res as Awaited <ReturnType <T>>
  }
}

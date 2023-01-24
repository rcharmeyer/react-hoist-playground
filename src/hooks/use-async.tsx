import { atom } from "jotai";
import { Fanc1, Func1 } from "../types";
import { useJotaiValue } from "../hoist";
import { atomFamily } from "jotai/utils";

export function makeAsyncByKey <T> (func: Fanc1 <T, string>): Func1 <T, string> {
    const theAtomFamily = atomFamily ((arg: string) => atom (async () => {
        return await func (arg)
    }))
    return (arg: string) => useJotaiValue (theAtomFamily (arg))
}

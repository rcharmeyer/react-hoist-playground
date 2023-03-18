import { atom, useAtom } from "jotai";
import {
  molecule,
  useMolecule,
  createScope,
  ScopeProvider
} from "jotai-molecules";
import { PropsWithChildren } from "react";

const InitialCountScope = createScope(0);
const countMolecule = molecule((getMol, getScope) => {
  const initialCont = getScope(InitialCountScope);
  return atom(initialCont);
});

export function useCounterState () {
  const countAtom = useMolecule(countMolecule);
  const [count, setCount] = useAtom(countAtom);
  return { count, setCount }
}

export function CounterProvider (props: PropsWithChildren <{ initial: number }>) {
  return (
    <ScopeProvider scope={InitialCountScope} value={props.initial}>
      {props.children}
    </ScopeProvider>
  )
}

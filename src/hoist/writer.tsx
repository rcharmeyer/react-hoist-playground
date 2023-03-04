import { atom, useSetAtom, WritableAtom } from "jotai"

// toJotaiReadable

type JotaiWritable <A extends unknown [] = unknown[]> = WritableAtom <any, A, void>
type InferArgs <T> = T extends JotaiWritable <infer A> ? A : never

const writerAtom = atom (null, (_, set, atom: JotaiWritable, ...args: InferArgs <typeof atom>) => {
  console.log ("writerAtom", atom.debugLabel ?? "unknown", ...args)
  set (atom, ...args)
})

const useSetWriterAtom = () => useSetAtom (writerAtom)

type GlobalWrite = ReturnType <typeof useSetWriterAtom>

const writeRef = {} as { current: GlobalWrite }

export function useGlobalWrite () {
  writeRef.current = useSetWriterAtom()
}

export function toJotaiReadable <T extends JotaiWritable> (writable: T) {
  return atom (() => (...args: InferArgs <T>) => {
    writeRef.current (writable, ...args)
  })
}

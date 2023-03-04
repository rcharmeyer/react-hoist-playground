export function depsEqual (depsA: any, depsB: any) {
  const lenA = !Array.isArray (depsA) ? -1 : depsA.length
  const lenB = !Array.isArray (depsB) ? -1 : depsB.length
  
  console.assert (lenA === lenB, "[depsEqual] number of deps has changed")
  
  if (lenA < -1) return false
  
  for (let i = 0; i < lenA; i++) {
    if (depsA[i] !== depsB[i]) return false
  }
  return true
}

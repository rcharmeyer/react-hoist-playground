export type Func <R = any, A extends any[] = any[]> = (...args: A) => R
export type Vunc <A extends any[] = any[]> = (...args: A) => void
export type Runc <A extends any[] = any[]> = (...args: A) => any

export type Func0 <R = any> = () => R
export type Vunc0 = () => void
export type Runc0 = () => any

export type Func1 <R = any, A = any> = (arg: A) => R
export type Vunc1 <A = any> = (arg: A) => void
export type Runc1 <A = any> = (arg: A) => any

export type Func2 <R = any, A1 = any, A2 = any> = (arg1: A1, arg2: A2) => R
export type Vunc2 <A1 = any, A2 = any> = (arg1: A1, arg2: A2) => void
export type Runc2 <A1 = any, A2 = any> = (arg1: A1, arg2: A2) => any

// Async

export type Fanc <R = any, A extends any[] = any[]> = (...args: A) => Promise <R>
export type Vanc <A extends any[] = any[]> = (...args: A) => Promise <void>
export type Ranc <A extends any[] = any[]> = (...args: A) => Promise <any>

export type Fanc0 <R = any> = () => Promise <R>
export type Vanc0 = () => Promise <void>
export type Ranc0 = () => Promise <any>

export type Fanc1 <R = any, A = any> = (arg: A) => Promise <R>
export type Vanc1 <A = any> = (arg: A) => Promise <void>
export type Ranc1 <A = any> = (arg: A) => Promise <any>
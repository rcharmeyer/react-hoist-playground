# React Hoist Playground

Welcome! This is a playground for a proposed React API called `hoist`. Here are some helpful links:

[Github](https://github.com/rcharmeyer/react-hoist-playground/)

[CodeSandbox](https://codesandbox.io/p/github/rcharmeyer/react-hoist-playground/main)

[View RFC](https://github.com/reactjs/rfcs/pull/241)

## What is hoisting?

Hoisting is when state that is shared between components is held by a common ancestor and then passed down through props or context.

Hoisting with the built-in APIs has many downsides which is why we have so many third-party state management solutions. These third-party solutions come with their own compromises but they're often worth it because they solve for a significant gap in the React API.

`hoist` is an attempt to solve for the same gap in the React API but without the compromises of third-party solutions. With `hoist` you're just using hooks to write your logic and `hoist` handles the sharing of those hooks between components.

## What is this playground?

Personally, I find it easier to understand an API when I can play with it. This is a place to experiment with `hoist` and get a feel for how it would work.

Keep in mind, there are going to be some issues, bugs, and missing features. Please oepn an issue for them on Github and I'll see if I can fix them.

I hope you'll find `hoist` as promising as I do! If you like what you see please consider supporting the RFC by leaving a comment; that will help get the attention of the Core Team.

## Caveats

- Devtools doesn't work for components that use a hoisted hook.
- Some components are being wrapped `React.memo` automatically.
- `Context.Provider` includes a Suspense boundary to avoid a bug.
- `makeAsync` is a utility for creating hooks for async functions.
- There is a `useEvent` hook but it's not the same as React's implementation.

## Supported APIs

- [x] Suspense
- [x] Error Boundaries
- [x] `useMemo`
- [x] `useCallback`
- [x] `useContext`
- [x] `useState`
- [x] `useReducer`
- [x] `useRef`
- [x] `useEffect`
- [] `useLayoutEffect`
- [] `useImperativeHandle`
- [] `useTransition`
- [] `useDeferredValue`
- [] `useId`
- [] `useMutableSource`
- [] `useSyncExternalStore`

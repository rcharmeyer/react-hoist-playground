import { memoize } from "lodash-es"
import { createContext, memo, PropsWithChildren, PureComponent, Suspense, useMemo, useState } from "react"
import { Func0, Vunc } from "../types"
import { createInternalListStore, createInternalStore, useInternalStore } from "./internal-store"
import { ScopeProvider } from "./scopes-context"
import { Scope, Snapshot, StoreBuilder } from "./types"

type RendererProps = {
  hook: Func0 <any>,
  onChange: (snapshot: Snapshot) => void,
}

function HookRenderer (props: RendererProps) {
  const result = props.hook()
  props.onChange ({ result })
  return null
}

class StoreRenderer extends PureComponent <RendererProps> {
  componentDidCatch (thrown: any) {
    this.props.onChange ({ thrown })
  }

  render () {
    return <HookRenderer {...this.props} />
  }
}

export function createScope () {
  const InternalContext = createContext <StoreBuilder> (undefined as any)
  InternalContext.Provider = memo (InternalContext.Provider)

  const scope: Partial<Scope> = memo ((props: PropsWithChildren) => {    
    const rendererListStore = useMemo (() => {
      return createInternalListStore <RendererProps> ()
    }, [])

    const [ getStore ] = useState (() => memoize ((hook) => {
      if (!hook) throw new Error ("hook not found")

      let onInitResolve: Vunc
      const thrown = new Promise <void> ((resolve) => {
        onInitResolve = () => {
          resolve()
        }
      })

      const hookStore = createInternalStore <Snapshot> ({ thrown })

      // unsuspend after init
      const onInitCleanup = hookStore.subscribe (() => {
        onInitResolve ()
        onInitCleanup ()
      })

      rendererListStore.add ({
        hook,
        onChange: hookStore.write,
      })

      return hookStore
    }))

    const renderers = useInternalStore (rendererListStore)

    const renderedStores = renderers.map ((rendererProps, i) => (
      <StoreRenderer key={i} {...rendererProps} />
    ))

    return (
      <InternalContext.Provider value={getStore}>
        <ScopeProvider scope={scope as Scope}>
          <Suspense>
            {props.children}
          </Suspense>
          {renderedStores}
        </ScopeProvider>
      </InternalContext.Provider>
    )
  })

  // TODO: Support imperfect scoping
  scope.context = InternalContext

  return scope as Scope
}

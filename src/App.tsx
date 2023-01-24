import { Suspense } from "react";
import "./App.css";
import { ProductPage } from "./product/card";

function App () {
  return (
    <Suspense>
      <ProductPage />
    </Suspense>
  )
}

/*
function LazyLoader (props: any) {
  const mounted = useMounted ()
  
  if (!mounted && props.active) return null
  return props.children
}

function App() {
  return (
    <div className="App space-y-4">
      <LazyLoader active={false}>
        <Suspense>
          <div className="flex flex-row items-center justify-around space-x-4">
            <TechIdContext.Provider value="react">
              <TechCard />
            </TechIdContext.Provider>
            <TechIdContext.Provider value="vite">
              <TechCard />
            </TechIdContext.Provider>
          </div>
        </Suspense>
      </LazyLoader>
      
      <div className="flex flex-row items-center justify-around space-x-4">
        <LazyLoader active>
          <Counter border category="swatch" />
          <Counter border />
        </LazyLoader>
      </div>
    </div>
  );
}
*/

export default App;

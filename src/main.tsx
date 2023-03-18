import "./runtime";

import ReactDOM from "react-dom/client";
// import { App } from "./app-root";
import { App } from "./counter/page";
import { AtomicRoot } from "./hoist";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AtomicRoot>
    <App />
  </AtomicRoot>
);

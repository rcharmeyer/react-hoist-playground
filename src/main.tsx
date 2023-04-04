import ReactDOM from "react-dom/client";
import { App } from "./app-root";
import "./index.css";
import { RootScope } from "@rcharmeyer/react-utils";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RootScope>
    <App />
  </RootScope>
);

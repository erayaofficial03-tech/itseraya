import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Note: Service-worker eviction + cache wipe runs from index.html before
// this module loads. Keep it there so it executes even when this bundle
// fails to parse on an old browser.

createRoot(document.getElementById("root")!).render(<App />);

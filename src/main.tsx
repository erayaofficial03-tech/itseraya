import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Manifest-only PWA — no service worker is registered by the app.
// Proactively unregister any previously installed service worker and wipe its
// caches so returning customers who had the old caching PWA installed get a
// clean, always-fresh experience.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}
if ("caches" in window) {
  caches
    .keys()
    .then((keys) => keys.forEach((k) => caches.delete(k)))
    .catch(() => {});
}

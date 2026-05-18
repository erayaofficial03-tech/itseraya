import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Immediate SW registration for fastest update detection on production.
const isInIframeMain = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();
const isPreviewHostMain =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

if (!isInIframeMain && !isPreviewHostMain) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  }).catch(() => {});
}

// PWA service worker — never register inside iframe or Lovable preview hosts.
// In those contexts, proactively unregister any previously installed SW so the
// preview is never served from a stale cached shell.
const isInIframe = (() => {
  try { return window.self !== window.top; } catch { return true; }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
} else if ("serviceWorker" in navigator) {
  // When a new SW takes control (skipWaiting + clientsClaim), reload once so
  // users land on the freshly published build. PwaUpdateHandler drives the
  // actual registration + update polling via useRegisterSW.
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}

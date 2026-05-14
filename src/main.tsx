import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// PWA service worker — never register inside iframe or Lovable preview hosts
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
  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      // Poll for a new build every 60s so visitors auto-refresh after a publish
      onRegisteredSW(swUrl, registration) {
        if (!registration) return;
        const check = () => registration.update().catch(() => {});
        setInterval(check, 60_000);
        // Also re-check whenever the tab regains focus
        window.addEventListener("focus", check);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
      },
      // New build detected → wipe caches and reload silently
      async onNeedRefresh() {
        try {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        } catch {}
        updateSW(true);
      },
    });
  });
}

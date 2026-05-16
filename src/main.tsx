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
  // Belt-and-braces: when a new SW takes control, reload once so users land
  // on the freshly published build without any prompt.
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });

  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      // Poll for a new build every 60s so visitors auto-refresh after a publish
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        const check = () => registration.update().catch(() => {});
        check();
        setInterval(check, 60_000);
        window.addEventListener("focus", check);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
      },
      // New build detected → wipe caches and silently activate it.
      // controllerchange (above) then triggers a single reload.
      async onNeedRefresh() {
        try {
          const names = await caches.keys();
          await Promise.all(names.map((n) => caches.delete(n)));
        } catch {}
        try {
          await updateSW(true);
        } catch {
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          } catch {}
          window.location.reload();
        }
      },
    });
  });
}

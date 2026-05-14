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
  Promise.all([
    import("virtual:pwa-register"),
    import("sonner"),
  ]).then(([{ registerSW }, { toast }]) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast("A new version of Eraya is available", {
          description: "Reload to get the latest improvements.",
          duration: Infinity,
          action: {
            label: "Reload",
            onClick: () => updateSW(true),
          },
        });
      },
      onOfflineReady() {
        toast.success("Eraya is ready to use offline");
      },
    });
  });
}

import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Silent PWA updater.
 *
 * - Polls the SW for new versions every 30s while the app is open.
 * - When a new build is detected, activates it (skipWaiting + clientsClaim
 *   from the workbox config make this instant) and reloads the page so users
 *   land on the fresh assets — no prompt, no banner.
 *
 * Guarded against Lovable preview / iframe hosts (handled in main.tsx by
 * unregistering any existing SW before this component mounts).
 */
const PwaUpdateHandler = () => {
  const isInIframe = (() => {
    try { return typeof window !== "undefined" && window.self !== window.top; } catch { return true; }
  })();
  const isPreviewHost =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("id-preview--") ||
      window.location.hostname.includes("lovableproject.com") ||
      window.location.hostname.includes("lovable.app"));

  const skip = isInIframe || isPreviewHost;

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration || skip) return;
      const check = () => registration.update().catch(() => {});
      check();
      const interval = setInterval(check, 30 * 1000);
      const onFocus = () => check();
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      return () => {
        clearInterval(interval);
        window.removeEventListener("focus", onFocus);
      };
    },
    onRegisterError(error) {
      console.warn("[Eraya SW] Registration error:", error);
    },
  });

  useEffect(() => {
    if (!needRefresh || skip) return;
    // Small delay so any in-flight requests complete before reload.
    const timer = setTimeout(() => {
      updateServiceWorker(true).catch(() => window.location.reload());
    }, 1000);
    return () => clearTimeout(timer);
  }, [needRefresh, updateServiceWorker, skip]);

  return null;
};

export default PwaUpdateHandler;

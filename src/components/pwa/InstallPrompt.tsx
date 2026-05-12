import { useEffect, useState } from "react";
import { useLocation, matchPath } from "react-router-dom";
import { Download, Plus, Share, X } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "eraya:a2hs-dismissed-at";
const IOS_DISMISS_KEY = "eraya:a2hs-ios-dismissed-at";
const PRODUCT_VISITED_KEY = "eraya:a2hs-product-visited";
const REJECT_KEY = "eraya:a2hs-rejected-at";
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const REJECT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 30; // 30 days (after rejecting native prompt)
const MIN_TIME_ON_SITE_MS = 30_000; // 30 seconds
const IOS_FIRST_VISIT_DELAY_MS = 4000;

const isIosSafari = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPhone/iPad/iPod, plus iPad on iOS 13+ which reports Macintosh + touch
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1);
  if (!iOS) return false;
  // Real Safari (exclude Chrome/Firefox/Edge on iOS which still use WebKit)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua);
  return isSafari;
};

const InstallPrompt = () => {
  const location = useLocation();
  const { data: settings } = useSettings();
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);
  const [visitedProduct, setVisitedProduct] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem(PRODUCT_VISITED_KEY) === "1"
  );
  const [timeElapsed, setTimeElapsed] = useState(false);
  const [isIos, setIsIos] = useState(false);

  // Track product-page visits (persists across reloads)
  useEffect(() => {
    if (visitedProduct) return;
    if (matchPath({ path: ROUTES.product, end: true }, location.pathname)) {
      localStorage.setItem(PRODUCT_VISITED_KEY, "1");
      setVisitedProduct(true);
    }
  }, [location.pathname, visitedProduct]);

  // 30-second time-on-site gate
  useEffect(() => {
    const t = setTimeout(() => setTimeElapsed(true), MIN_TIME_ON_SITE_MS);
    return () => clearTimeout(t);
  }, []);

  // Capture install event + appinstalled, detect iOS Safari
  useEffect(() => {
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (isStandalone) return;

    setIsIos(isIosSafari());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setVisible(false);
      setIosVisible(false);
      setEvt(null);
      localStorage.removeItem(DISMISS_KEY);
      localStorage.removeItem(REJECT_KEY);
      localStorage.removeItem(IOS_DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Reveal prompts only after both gates are satisfied
  useEffect(() => {
    if (!visitedProduct || !timeElapsed) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const dismissedRecently =
      dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
    const rejectedAt = Number(localStorage.getItem(REJECT_KEY) || 0);
    const rejectedRecently =
      rejectedAt && Date.now() - rejectedAt < REJECT_COOLDOWN_MS;
    if (evt && !dismissedRecently && !rejectedRecently) setVisible(true);

    if (isIos) {
      const iosDismissedAt = Number(localStorage.getItem(IOS_DISMISS_KEY) || 0);
      const iosDismissedRecently =
        iosDismissedAt && Date.now() - iosDismissedAt < DISMISS_COOLDOWN_MS;
      if (!iosDismissedRecently) {
        const t = setTimeout(() => setIosVisible(true), IOS_FIRST_VISIT_DELAY_MS);
        return () => clearTimeout(t);
      }
    }
  }, [visitedProduct, timeElapsed, evt, isIos]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  const install = async () => {
    if (!evt) return;
    try {
      await evt.prompt();
      const choice = await evt.userChoice;
      if (choice.outcome === "dismissed") {
        // User saw the native browser prompt and rejected it — back off for 30 days
        localStorage.setItem(REJECT_KEY, String(Date.now()));
      }
    } finally {
      setVisible(false);
      setEvt(null);
    }
  };

  const dismissIos = () => {
    setIosVisible(false);
    localStorage.setItem(IOS_DISMISS_KEY, String(Date.now()));
  };

  // Hide on admin pages and when admin disabled it from settings
  if (location.pathname.startsWith("/admin")) return null;
  if (!s(settings, "install_prompt_visible")) return null;
  if (!visible && !iosVisible) return null;

  const promoText = s(settings, "install_prompt_text");
  const installLabel = s(settings, "install_prompt_button_label");

  return (
    <>
      {visible && (
        <div
          role="dialog"
          aria-label="Install Eraya app"
          className="fixed inset-x-3 bottom-3 z-[60] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div
            className="rounded-2xl border border-gold/40 bg-background/95 backdrop-blur shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.45)] p-4 flex items-start gap-3"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(var(--ivory)) 0%, hsl(var(--background)) 60%)",
            }}
          >
            <span
              className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-charcoal"
              style={{ background: "var(--gradient-gold, linear-gradient(135deg, #E0C36B, #C9A84C))" }}
              aria-hidden="true"
            >
              <Download className="h-5 w-5" />
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-serif text-base text-foreground leading-tight">{promoText}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Faster access, offline browsing, and an app-like experience.
              </p>
              <p className="text-[11px] text-muted-foreground/80 mt-1 italic">
                Changed your mind later? You can install anytime from your browser menu.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={install}
                  className="text-sm font-medium px-4 py-2 rounded-full text-charcoal transition-opacity hover:opacity-90"
                  style={{ background: "var(--gradient-gold, linear-gradient(135deg, #E0C36B, #C9A84C))" }}
                >
                  {installLabel}
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-xs font-medium tracking-wide text-muted-foreground hover:text-foreground px-2 py-2"
                >
                  Not now
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="shrink-0 -mt-1 -mr-1 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {iosVisible && (
        <div
          role="dialog"
          aria-label="Add Eraya to Home Screen on iPhone"
          className="fixed inset-x-3 bottom-3 z-[60] sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div
            className="rounded-2xl border border-gold/40 bg-background/95 backdrop-blur shadow-[0_10px_30px_-10px_hsl(var(--gold)/0.45)] p-4"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(var(--ivory)) 0%, hsl(var(--background)) 60%)",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-charcoal"
                style={{ background: "var(--gradient-gold, linear-gradient(135deg, #E0C36B, #C9A84C))" }}
                aria-hidden="true"
              >
                <Download className="h-5 w-5" />
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-serif text-base text-foreground leading-tight">
                  Install Eraya on your iPhone
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add it to your Home Screen for an app-like experience.
                </p>
              </div>

              <button
                type="button"
                onClick={dismissIos}
                aria-label="Dismiss"
                className="shrink-0 -mt-1 -mr-1 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ol className="mt-4 space-y-2 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <span className="shrink-0 h-6 w-6 rounded-full bg-gold/15 text-charcoal text-xs font-semibold flex items-center justify-center">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Tap the
                  <Share className="h-4 w-4 text-gold" aria-label="Share" />
                  Share button in Safari
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="shrink-0 h-6 w-6 rounded-full bg-gold/15 text-charcoal text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Choose
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gold/40 text-xs">
                    <Plus className="h-3 w-3" /> Add to Home Screen
                  </span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="shrink-0 h-6 w-6 rounded-full bg-gold/15 text-charcoal text-xs font-semibold flex items-center justify-center">
                  3
                </span>
                <span>Tap <span className="font-medium">Add</span> to finish</span>
              </li>
            </ol>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={dismissIos}
                className="text-xs font-medium tracking-wide text-muted-foreground hover:text-foreground px-2 py-2"
              >
                Got it
              </button>
            </div>

            {/* Pointer to Safari share button (bottom toolbar on iPhone) */}
            <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-background border-r border-b border-gold/40" />
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;

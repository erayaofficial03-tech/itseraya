import { useEffect, useState } from "react";
import { Download, Plus, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = "eraya:a2hs-dismissed-at";
const IOS_DISMISS_KEY = "eraya:a2hs-ios-dismissed-at";
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
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
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);

  useEffect(() => {
    // Already installed?
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (isStandalone) return;

    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    const dismissedRecently =
      dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      if (!dismissedRecently) setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      setIosVisible(false);
      setEvt(null);
      localStorage.removeItem(DISMISS_KEY);
      localStorage.removeItem(IOS_DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari fallback — beforeinstallprompt never fires there
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIosSafari()) {
      const iosDismissedAt = Number(localStorage.getItem(IOS_DISMISS_KEY) || 0);
      const iosDismissedRecently =
        iosDismissedAt && Date.now() - iosDismissedAt < DISMISS_COOLDOWN_MS;
      if (!iosDismissedRecently) {
        iosTimer = setTimeout(() => setIosVisible(true), IOS_FIRST_VISIT_DELAY_MS);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

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
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
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

  if (!visible && !iosVisible) return null;

  return (
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
          <p className="font-serif text-base text-foreground leading-tight">Add Eraya to your Home Screen</p>
          <p className="text-xs text-muted-foreground mt-1">
            Faster access, offline browsing, and an app-like experience.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={install}
              className="text-sm font-medium px-4 py-2 rounded-full text-charcoal transition-opacity hover:opacity-90"
              style={{ background: "var(--gradient-gold, linear-gradient(135deg, #E0C36B, #C9A84C))" }}
            >
              Install
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
  );
};

export default InstallPrompt;

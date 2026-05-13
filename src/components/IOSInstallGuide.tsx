import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useId, useRef } from "react";
import erayaLogo from "@/assets/eraya-logo.png";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { logInstallEvent } from "@/lib/installAnalytics";

interface IOSInstallGuideProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const IOSInstallGuide = ({ open, onClose }: IOSInstallGuideProps) => {
  const { isIOSNonSafari } = useInstallPrompt();
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

  // Esc to close + body scroll lock
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab" && sheetRef.current) {
        const nodes = sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the sheet on next frame so the animated node is mounted
    const t = window.setTimeout(() => {
      const first = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.origin);
      logInstallEvent("copy_link", "ios");
      toast.success("Link copied! Open Safari and paste it to install");
    } catch {
      toast.error("Couldn't copy link — please type itseraya.in in Safari");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/60"
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            tabIndex={-1}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[92vh] overflow-y-auto focus:outline-none"
          >
            <div className="w-10 h-1 bg-[#EDE8E1] rounded-full mx-auto mb-6" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F0EA]"
            >
              <X className="w-4 h-4 text-[#9A8F85]" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <img
                src={erayaLogo}
                alt="Eraya"
                className="h-12 object-contain mb-3"
              />
              {isIOSNonSafari ? (
                <>
                  <h2 className="font-serif text-xl text-[#2C2C2C] text-center">
                    Open in Safari First
                  </h2>
                  <p className="text-sm text-[#9A8F85] text-center mt-1">
                    iPhone can only install apps from Safari
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-serif text-xl text-[#2C2C2C] text-center">
                    Add Eraya to Your Home Screen
                  </h2>
                  <p className="text-sm text-[#9A8F85] text-center mt-1">
                    Follow these 3 simple steps in Safari
                  </p>
                </>
              )}
            </div>

            {isIOSNonSafari ? (
              <div className="space-y-4 mb-6">
                <Step
                  n={1}
                  title="Copy this link"
                  body="Tap the button below to copy itseraya.in"
                />
                <Connector />
                <Step
                  n={2}
                  title="Open the Safari app"
                  body="Look for the blue compass icon on your home screen"
                />
                <Connector />
                <Step
                  n={3}
                  title="Paste & visit the site"
                  body="Then tap the Install button again from Safari"
                />
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <Step
                  n={1}
                  title="Tap the Share button"
                  body="At the bottom of your Safari browser, tap the share icon"
                >
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-[#F5F0EA] px-3 py-1.5 rounded-lg">
                    <div className="w-5 h-5 border-2 border-[#C9A84C] rounded flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[5px] border-l-transparent border-r-transparent border-b-[#C9A84C] -mt-0.5" />
                    </div>
                    <span className="text-xs font-medium text-[#C9A84C]">Share</span>
                  </div>
                </Step>
                <Connector />
                <Step
                  n={2}
                  title='Tap "Add to Home Screen"'
                  body="Scroll down in the share menu to find this option"
                >
                  <div className="mt-2 inline-flex items-center gap-2 bg-white border border-[#EDE8E1] px-3 py-2 rounded-xl shadow-sm">
                    <div className="w-7 h-7 bg-[#F5F0EA] rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-[#2C2C2C]" />
                    </div>
                    <span className="text-xs font-medium text-[#2C2C2C]">Add to Home Screen</span>
                  </div>
                </Step>
                <Connector />
                <Step
                  n={3}
                  title='Tap "Add" to confirm'
                  body="Eraya will appear on your home screen like a native app"
                >
                  <div className="mt-2 inline-flex items-center gap-2">
                    <div className="bg-[#007AFF] text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
                      Add
                    </div>
                    <span className="text-xs text-[#9A8F85]">← tap this</span>
                  </div>
                </Step>
              </div>
            )}

            {!isIOSNonSafari && (
              <div className="bg-[#FFF8E7] border border-[#F5D78E] rounded-2xl p-4 mb-5">
                <div className="flex gap-2 items-start">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-xs font-semibold text-[#2C2C2C]">
                      Must use Safari browser
                    </p>
                    <p className="text-xs text-[#9A8F85] mt-0.5">
                      This only works in Safari on iPhone. If you're using Chrome or another browser, open itseraya.in in Safari first.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#FAF8F5] border border-[#EDE8E1] rounded-2xl p-4 mb-6">
              <div className="flex gap-3 items-center">
                <img
                  src="/maskable-192.png"
                  alt="Eraya app icon"
                  className="w-14 h-14 rounded-2xl shadow-sm"
                />
                <div>
                  <p className="text-sm font-semibold text-[#2C2C2C]">Eraya</p>
                  <p className="text-xs text-[#9A8F85]">itseraya.in</p>
                  <p className="text-xs text-[#C9A84C] mt-0.5">
                    ✓ Works offline · No App Store needed
                  </p>
                </div>
              </div>
            </div>

            {isIOSNonSafari ? (
              <>
                <button
                  onClick={copyLink}
                  className="w-full py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-sm"
                >
                  Copy link
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 mt-3 rounded-full border border-[#EDE8E1] text-[#9A8F85] text-sm"
                >
                  Got it
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-sm"
                >
                  Got it, I'll try now!
                </button>
                <button
                  onClick={copyLink}
                  className="w-full py-3 mt-3 rounded-full border border-[#EDE8E1] text-[#9A8F85] text-sm"
                >
                  Copy link to open in Safari
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Step = ({
  n,
  title,
  body,
  children,
}: {
  n: number;
  title: string;
  body: string;
  children?: React.ReactNode;
}) => (
  <div className="flex gap-4 items-start">
    <div className="w-9 h-9 rounded-full bg-[#C9A84C] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
      {n}
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-[#2C2C2C]">{title}</p>
      <p className="text-xs text-[#9A8F85] mt-0.5">{body}</p>
      {children}
    </div>
  </div>
);

const Connector = () => <div className="ml-4 w-0.5 h-3 bg-[#EDE8E1]" />;

export default IOSInstallGuide;

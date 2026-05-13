import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, RefreshCw, Chrome, CheckCircle2, Copy } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const InstallTroubleshootSheet = ({ open, onClose }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();

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
        if (!nodes.length) return e.preventDefault();
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
    const t = window.setTimeout(() => {
      sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
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
      toast.success("Link copied — open it in Chrome or Edge to install");
    } catch {
      toast.error("Couldn't copy link — please type itseraya.in manually");
    }
  };

  const reload = () => window.location.reload();

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
              type="button"
              onClick={onClose}
              aria-label="Close troubleshooting"
              className="absolute top-5 right-5 p-2 rounded-full bg-[#F5F0EA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
            >
              <X className="w-4 h-4 text-[#9A8F85]" aria-hidden="true" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-[#FFF4E5] flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6 text-[#C9A84C]" aria-hidden="true" />
              </div>
              <h2 id={titleId} className="font-serif text-xl text-[#2C2C2C] text-center">
                Install isn't available right now
              </h2>
              <p id={descId} className="text-sm text-[#9A8F85] text-center mt-1">
                Try one of the fixes below — most take just a few seconds.
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <Fix
                icon={<Chrome className="w-4 h-4" />}
                title="Use Chrome, Edge, or Brave"
                body="Install only works in Chromium-based browsers on Android & desktop. Firefox, Samsung Internet and in-app browsers (Instagram, Facebook) don't support it."
              />
              <Fix
                icon={<RefreshCw className="w-4 h-4" />}
                title="Reload the page"
                body="The browser sometimes needs a fresh visit before it'll offer the install option."
              />
              <Fix
                icon={<CheckCircle2 className="w-4 h-4" />}
                title="Check if it's already installed"
                body="Look for the Eraya icon in your app drawer or home screen — if it's there, you're all set."
              />
              <Fix
                icon={<AlertCircle className="w-4 h-4" />}
                title="Open in a normal browser tab"
                body="If you tapped a link from Instagram, WhatsApp or another app, tap the ⋮ menu and choose 'Open in browser' first."
              />
            </ul>

            <div className="bg-[#FAF8F5] border border-[#EDE8E1] rounded-2xl p-4 mb-6">
              <p className="text-xs text-[#9A8F85]">
                Still stuck? You can always use Eraya right here in your browser — no
                install needed. Or message us on WhatsApp and we'll guide you through it.
              </p>
            </div>

            <button
              type="button"
              onClick={reload}
              className="w-full py-4 rounded-full bg-[#C9A84C] text-white font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2"
            >
              Reload & try again
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="w-full py-3 mt-3 rounded-full border border-[#EDE8E1] text-[#9A8F85] text-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
            >
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              Copy link to open elsewhere
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Fix = ({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <li className="flex gap-3 items-start">
    <div className="w-8 h-8 rounded-full bg-[#F5F0EA] text-[#C9A84C] flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-[#2C2C2C]">{title}</p>
      <p className="text-xs text-[#9A8F85] mt-0.5">{body}</p>
    </div>
  </li>
);

export default InstallTroubleshootSheet;

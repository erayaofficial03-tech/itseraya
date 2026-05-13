import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAnnouncements, useSettings, type Announcement } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const STORAGE_KEY = "eraya:announcement-dismissed-v2";

const readDismissed = (): string[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const AnnouncementBar = () => {
  const { data: announcements = [], isLoading } = useAnnouncements();
  const { data: settings } = useSettings();
  const [dismissed, setDismissed] = useState<string[]>(() => readDismissed());
  const [index, setIndex] = useState(0);

  // Fallback: legacy single announcement from settings if table is empty
  const legacy: Announcement | null = useMemo(() => {
    if (announcements.length > 0) return null;
    if (!s(settings, "announcement_visible")) return null;
    const text = s(settings, "announcement_text");
    if (!text) return null;
    return {
      id: `legacy:${text}`,
      title: null,
      message: text,
      cta_text: null,
      cta_url: null,
      bg_color: settings?.announcement_bg_color || "#1C1C1C",
      text_color: settings?.announcement_text_color || "#C9A84C",
      is_active: true,
      display_order: 0,
      starts_at: null,
      expires_at: null,
      is_marquee: false,
    };
  }, [announcements.length, settings]);

  const visible = useMemo(
    () => (announcements.length ? announcements : legacy ? [legacy] : []).filter((a) => !dismissed.includes(a.id)),
    [announcements, legacy, dismissed],
  );

  useEffect(() => {
    if (visible.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % visible.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [visible.length]);

  useEffect(() => {
    if (index >= visible.length) setIndex(0);
  }, [index, visible.length]);

  if (isLoading) return null;
  if (visible.length === 0) return null;

  const current = visible[index] ?? visible[0];
  const dismissible = announcements.length === 0 ? !!s(settings, "announcement_dismissible") : true;

  const dismiss = () => {
    const next = [...dismissed, current.id];
    setDismissed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const Inner = (
    <span className="px-6 inline-flex items-center gap-2">
      {current.title && <strong className="font-semibold">{current.title}:</strong>}
      <span>{current.message}</span>
      {current.cta_text && current.cta_url && (
        <a
          href={current.cta_url}
          className="underline underline-offset-2 font-medium hover:opacity-80"
        >
          {current.cta_text}
        </a>
      )}
    </span>
  );

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="w-full text-center text-xs sm:text-sm font-medium px-3 py-1.5 relative overflow-hidden"
      style={{
        backgroundColor: current.bg_color || "#1C1C1C",
        color: current.text_color || "#C9A84C",
      }}
    >
      {current.is_marquee ? (
        <div className="whitespace-nowrap">
          <motion.div
            className="inline-block"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {Inner}
          </motion.div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3 }}
          >
            {Inner}
          </motion.div>
        </AnimatePresence>
      )}
      {dismissible && (
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: current.text_color || "#C9A84C" }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;

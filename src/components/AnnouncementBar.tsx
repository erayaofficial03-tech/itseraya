import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const STORAGE_KEY = "eraya:announcement-dismissed";

const AnnouncementBar = () => {
  const { data: settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissal state when text changes so a new announcement reappears
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    setDismissed(stored === settings?.announcement_text);
  }, [settings?.announcement_text]);

  if (!s(settings, "announcement_visible")) return null;
  if (dismissed) return null;

  const text = s(settings, "announcement_text");
  const dismissible = s(settings, "announcement_dismissible");

  const onDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, text);
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="w-full text-center text-xs sm:text-sm font-medium px-3 py-1.5 relative bg-charcoal text-gold"
    >
      <span className="px-6">{text}</span>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors text-gold"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default AnnouncementBar;

import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSettings } from "@/lib/queries";
import { openWhatsApp } from "@/lib/whatsapp";

const STORAGE_KEY = "eraya:wa-float-tapped";

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.27-1.38a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01zM12.05 20.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.21 8.21 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.16 1.74 2.66 4.21 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/>
  </svg>
);

const WhatsAppFloat = () => {
  const { pathname } = useLocation();
  const { data: settings } = useSettings();

  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/")) return null;
  const wa = settings?.whatsapp_number?.replace(/\D/g, "") ?? "";
  if (!/^91[6-9]\d{9}$/.test(wa)) return null;
  if ((settings as any)?.whatsapp_float_visible === false) return null;

  const handleClick = () => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, "1");
    const num = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!num) {
      toast("WhatsApp coming soon!");
      return;
    }
    openWhatsApp(num, "Hi Eraya! I'd like to know more about your jewellery collection 💛", "float_button");
  };


  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="group fixed bottom-[72px] right-4 md:bottom-8 md:right-6 z-40 w-[54px] h-[54px] rounded-full text-white flex items-center justify-center shadow-lg"
      style={{ backgroundColor: "#25D366" }}
    >
      <WhatsAppIcon className="h-7 w-7 relative z-10" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:md:block bg-charcoal text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
        Chat on WhatsApp
      </span>
    </motion.button>
  );
};

export default WhatsAppFloat;

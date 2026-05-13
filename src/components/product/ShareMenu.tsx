import { useState } from "react";
import { Share2, Link as LinkIcon, FileDown, Smartphone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import type { Product, Settings } from "@/lib/queries";
import { generateProductPdf } from "@/lib/pdf";

interface ShareMenuProps {
  product: Product;
  settings: Settings | undefined;
  buttonLabel: string;
  className?: string;
}

const ShareMenu = ({ product, settings, buttonLabel, className }: ShareMenuProps) => {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy link");
    }
    setOpen(false);
  };

  const shareWhatsApp = () => {
    const text = `${product.name}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
    setOpen(false);
  };

  const sharePdf = async () => {
    try {
      await generateProductPdf(product, settings);
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't create PDF");
    }
    setOpen(false);
  };

  const shareDevice = async () => {
    if (!navigator.share) {
      toast.info("Sharing isn't supported on this device — try Copy Link.");
      return;
    }
    try {
      await navigator.share({
        title: product.name,
        text: `Check out ${product.name} from Eraya`,
        url,
      });
    } catch {
      /* user cancelled */
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 /> {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1">
        <button
          onClick={shareWhatsApp}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-gold" /> Share on WhatsApp
        </button>
        <button
          onClick={sharePdf}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <FileDown className="h-4 w-4 text-gold" /> Share as PDF
        </button>
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
        >
          <LinkIcon className="h-4 w-4 text-gold" /> Copy link
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={shareDevice}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
          >
            <Smartphone className="h-4 w-4 text-gold" /> Share via device
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default ShareMenu;

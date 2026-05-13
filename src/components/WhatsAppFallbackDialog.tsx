import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { WHATSAPP_BLOCKED_EVENT, type WhatsAppBlockedDetail } from "@/lib/whatsapp";

/**
 * Global fallback shown when window.open to wa.me is blocked by the browser.
 * Mounted once near the app root. Listens for `whatsapp:blocked` events.
 */
const WhatsAppFallbackDialog = () => {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<WhatsAppBlockedDetail | null>(null);
  const [copiedKey, setCopiedKey] = useState<"link" | "message" | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<WhatsAppBlockedDetail>;
      if (!ce.detail) return;
      setDetail(ce.detail);
      setCopiedKey(null);
      setOpen(true);
    };
    window.addEventListener(WHATSAPP_BLOCKED_EVENT, handler);
    return () => window.removeEventListener(WHATSAPP_BLOCKED_EVENT, handler);
  }, []);

  const copy = async (key: "link" | "message", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      toast.success(key === "link" ? "Link copied" : "Message copied");
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1800);
    } catch {
      toast.error("Couldn't copy — please select and copy manually");
    }
  };

  if (!detail) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gold" />
            Open WhatsApp manually
          </DialogTitle>
          <DialogDescription>
            Your browser blocked the WhatsApp popup. Tap the link below to open the chat,
            then paste the message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              WhatsApp link
            </label>
            <div className="flex gap-2">
              <a
                href={detail.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate rounded-md border bg-muted/30 px-3 py-2 text-sm text-primary underline-offset-2 hover:underline"
              >
                {detail.url}
              </a>
              <Button
                size="icon"
                variant="outline"
                onClick={() => copy("link", detail.url)}
                aria-label="Copy link"
              >
                {copiedKey === "link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Message
            </label>
            <Textarea
              readOnly
              rows={6}
              value={detail.message}
              onFocus={(e) => e.currentTarget.select()}
              className="font-sans text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => copy("message", detail.message)}
              className="w-full"
            >
              {copiedKey === "message" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedKey === "message" ? "Copied" : "Copy message"}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
          <Button asChild className="text-charcoal" style={{ background: "var(--gradient-gold)" }}>
            <a href={detail.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" /> Open WhatsApp
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppFallbackDialog;

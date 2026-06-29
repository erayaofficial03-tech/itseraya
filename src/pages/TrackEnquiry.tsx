import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MessageCircle, Package } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSettings, formatINR } from "@/lib/queries";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

interface SessionRow {
  id: string;
  enquiry_ref: string | null;
  status: string;
  customer_name: string | null;
  notes: string | null;
  created_at: string;
}
interface ItemRow {
  id: string;
  product_name: string;
  product_price: number | null;
  product_image: string | null;
  selected_size: string | null;
  selected_colour: string | null;
  quantity: number;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 border-blue-300",
  contacted: "bg-amber-100 text-amber-800 border-amber-300",
  interested: "bg-purple-100 text-purple-800 border-purple-300",
  negotiation: "bg-indigo-100 text-indigo-800 border-indigo-300",
  closed_won: "bg-emerald-100 text-emerald-800 border-emerald-300",
  closed_lost: "bg-rose-100 text-rose-800 border-rose-300",
  followup_pending: "bg-orange-100 text-orange-800 border-orange-300",
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  contacted: "Contacted",
  interested: "Interested",
  negotiation: "In Negotiation",
  closed_won: "Confirmed",
  closed_lost: "Closed",
  followup_pending: "Follow-up Pending",
};

const TrackEnquiry = () => {
  const [params, setParams] = useSearchParams();
  const initialRef = params.get("ref") || "";
  const [code, setCode] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [searched, setSearched] = useState(false);
  const { data: settings } = useSettings();

  const lookup = async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setSearched(true);
    setSession(null);
    setItems([]);
    try {
      const { data, error } = await supabase.rpc("lookup_enquiry_by_ref", {
        _ref: ref.trim().toUpperCase(),
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        setLoading(false);
        return;
      }
      const { items: rowItems, ...sessionFields } = row as unknown as SessionRow & { items: ItemRow[] };
      setSession(sessionFields as SessionRow);
      setItems((rowItems || []) as ItemRow[]);
    } catch (e) {
      console.error(e);
      toast.error("Could not load enquiry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) lookup(initialRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueWhatsApp = () => {
    if (!session) return;
    const number = settings?.whatsapp_number?.replace(/\D/g, "");
    const msg = `Hi ERAYA! I'd like to follow up on my enquiry ${session.enquiry_ref}. Thank you!`;
    if (!number) {
      toast.info("WhatsApp number not set yet.");
      return;
    }
    openWhatsApp(number, msg);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams({ ref: code.trim().toUpperCase() });
    lookup(code);
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={`Track Enquiry — ${settings?.store_name || "Eraya"}`} description="Track your ERAYA enquiry status and details." />
      <Header />
      <main className="max-w-2xl mx-auto px-4 md:px-6 pt-8 pb-[76px]">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">Track Your Enquiry</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your enquiry ID (e.g. <span className="font-mono">ENQ-A4F7</span>) to view its status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENQ-XXXX"
            className="font-mono uppercase"
            autoFocus={!initialRef}
          />
          <Button type="submit" disabled={loading || !code.trim()} className="bg-charcoal text-white hover:bg-charcoal/90">
            <Search className="h-4 w-4 mr-2" />
            Track
          </Button>
        </form>

        {loading && (
          <p className="text-center text-sm text-muted-foreground py-8">Looking up your enquiry…</p>
        )}

        {!loading && searched && !session && (
          <Card className="p-8 text-center">
            <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium text-foreground">Enquiry not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Double-check your <span className="font-mono">{code}</span> code or contact us on WhatsApp.
            </p>
            {settings?.whatsapp_number && (
              <Button
                onClick={() => {
                  const num = settings.whatsapp_number!.replace(/\D/g, "");
                  openWhatsApp(num, `Hi Eraya! I can't find my enquiry ${code}. Can you help?`);
                }}
                className="mt-5 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp us
              </Button>
            )}
          </Card>
        )}

        {session && (
          <Card className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Enquiry ID</p>
                <p className="font-mono text-xl font-semibold text-gold">{session.enquiry_ref}</p>
              </div>
              <Badge
                variant="outline"
                className={`${STATUS_COLORS[session.status] || ""} text-xs uppercase tracking-wider`}
              >
                {STATUS_LABEL[session.status] || session.status}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Submitted on{" "}
              {new Date(session.created_at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Products ({items.length})</p>
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-3 items-center">
                    {it.product_image ? (
                      <img src={it.product_image} alt={it.product_name || "Eraya jewellery product"} className="h-12 w-12 rounded object-cover bg-muted" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{it.product_name}</p>
                      {(it.selected_size || it.selected_colour) && (
                        <p className="text-xs text-muted-foreground">
                          {[it.selected_size, it.selected_colour].filter(Boolean).join(" • ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      {it.product_price != null && (
                        <p className="font-medium text-gold">{formatINR(it.product_price * it.quantity)}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {session.notes && (
              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your note</p>
                <p className="text-sm">{session.notes}</p>
              </div>
            )}

            <Button
              onClick={handleContinueWhatsApp}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Continue on WhatsApp
            </Button>

            <Link to="/catalogue" className="block text-center text-xs text-muted-foreground hover:text-gold">
              Browse more jewellery →
            </Link>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrackEnquiry;

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Download, Inbox, Search, MessageCircle, Star, Eye } from "lucide-react";
import { formatINR, useAdminSettings } from "@/lib/queries";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";
import { logAdminActivity } from "@/lib/adminLog";
import * as XLSX from "xlsx";

type Enquiry = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number | null;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
  status: string | null;
  enquiry_ref: string | null;
  admin_notes: string | null;
  priority: string | null;
  follow_up_at: string | null;
};

type SessionItem = {
  id: string;
  product_name: string;
  product_price: number | null;
  product_image: string | null;
  selected_size: string | null;
  selected_colour: string | null;
  quantity: number;
};

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "contacted", label: "Contacted", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "interested", label: "Interested", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "negotiation", label: "Negotiation", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  { value: "closed_won", label: "Closed Won", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "closed_lost", label: "Closed Lost", color: "bg-rose-100 text-rose-800 border-rose-300" },
  { value: "followup_pending", label: "Follow-up Pending", color: "bg-orange-100 text-orange-800 border-orange-300" },
];

const statusColor = (status: string | null) =>
  STATUS_OPTIONS.find((s) => s.value === (status || "open"))?.color || "";
const statusLabel = (status: string | null) =>
  STATUS_OPTIONS.find((s) => s.value === (status || "open"))?.label || "Open";

const useEnquiries = () =>
  useQuery({
    queryKey: ["enquiries"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as Enquiry[];
    },
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

const EnquiriesAdmin = () => {
  const { data: enquiries = [], isLoading } = useEnquiries();
  const { data: settings } = useAdminSettings();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [items, setItems] = useState<SessionItem[]>([]);
  const [identityMap, setIdentityMap] = useState<Record<string, string | null>>({});

  // Map enquiry_ref -> user_id (null if anonymous WhatsApp guest)
  useEffect(() => {
    const refs = enquiries
      .map((e) => e.enquiry_ref)
      .filter((r): r is string => !!r);
    if (refs.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("enquiry_sessions")
        .select("enquiry_ref, user_id")
        .in("enquiry_ref", refs);
      const map: Record<string, string | null> = {};
      (data || []).forEach((row: any) => {
        if (row.enquiry_ref) map[row.enquiry_ref] = row.user_id ?? null;
      });
      setIdentityMap(map);
    })();
  }, [enquiries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = enquiries;
    if (tab === "open") list = list.filter((e) => (e.status || "open") === "open");
    else if (tab === "followup") list = list.filter((e) => e.status === "followup_pending");
    else if (tab === "won") list = list.filter((e) => e.status === "closed_won");
    else if (tab === "lost") list = list.filter((e) => e.status === "closed_lost");
    if (q) {
      list = list.filter((e) =>
        e.product_name.toLowerCase().includes(q) ||
        (e.customer_email ?? "").toLowerCase().includes(q) ||
        (e.customer_name ?? "").toLowerCase().includes(q) ||
        (e.enquiry_ref ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [enquiries, search, tab]);

  const updateField = async (id: string, patch: Partial<Enquiry>) => {
    const { error } = await supabase.from("enquiries").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["enquiries"] });
    const e = enquiries.find((x) => x.id === id);
    void logAdminActivity({
      action: "enquiry_updated",
      entity: "enquiry",
      entity_id: id,
      details: { ref: e?.enquiry_ref ?? id.slice(0, 8), changed: Object.keys(patch) },
    });
  };

  const openView = async (e: Enquiry) => {
    setViewing(e);
    setItems([]);
    if (e.enquiry_ref) {
      const { data: sess } = await supabase
        .from("enquiry_sessions").select("id").eq("enquiry_ref", e.enquiry_ref).maybeSingle();
      if (sess) {
        const { data: its } = await supabase
          .from("enquiry_items")
          .select("id, product_name, product_price, product_image, selected_size, selected_colour, quantity")
          .eq("session_id", sess.id);
        setItems((its || []) as SessionItem[]);
      }
    }
  };

  const replyOnWhatsApp = (e: Enquiry) => {
    const number = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!number) return toast.error("Set your WhatsApp number first.");
    const ref = e.enquiry_ref ? ` (${e.enquiry_ref})` : "";
    openWhatsApp(number, `Hi ${e.customer_name || "there"}, thanks for your enquiry${ref}! `);
  };

  const togglePriority = (e: Enquiry) =>
    updateField(e.id, { priority: e.priority === "high" ? "normal" : "high" });

  const exportExcel = () => {
    if (!filtered.length) return toast.info("No enquiries to export.");
    const rows = filtered.map((e) => ({
      Date: formatTime(e.created_at),
      Ref: e.enquiry_ref ?? "",
      Status: statusLabel(e.status),
      Product: e.product_name,
      Price: e.product_price ?? "",
      Customer: e.customer_name ?? "Guest",
      Email: e.customer_email ?? "",
      Notes: e.admin_notes ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, `eraya-enquiries-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Enquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Lead pipeline. Update status, add notes, mark priority, follow up.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 border-gold/40">
          <Inbox className="h-3 w-3" /> {enquiries.length} total
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start no-scrollbar">
          <TabsTrigger value="all" className="shrink-0">All</TabsTrigger>
          <TabsTrigger value="open" className="shrink-0">Open</TabsTrigger>
          <TabsTrigger value="followup" className="shrink-0">Follow-up</TabsTrigger>
          <TabsTrigger value="won" className="shrink-0">Closed Won</TabsTrigger>
          <TabsTrigger value="lost" className="shrink-0">Closed Lost</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Pipeline</CardTitle>
              <CardDescription>Most recent first.</CardDescription>
            </div>
            <Button onClick={exportExcel} variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ref, product, name, or email"
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading enquiries…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No enquiries match.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((e) => (
                  <div key={e.id} className="border border-border rounded-md p-3 hover:bg-muted/20">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {e.priority === "high" && <Star className="h-4 w-4 fill-amber-400 text-amber-500" />}
                      <span className="font-medium text-sm">{e.product_name}</span>
                      {e.enquiry_ref && (
                        <Badge variant="outline" className="font-mono text-[10px]">{e.enquiry_ref}</Badge>
                      )}
                      <Badge variant="outline" className={`${statusColor(e.status)} text-[10px]`}>
                        {statusLabel(e.status)}
                      </Badge>
                      {(() => {
                        const uid = e.enquiry_ref ? identityMap[e.enquiry_ref] : null;
                        return uid ? (
                          <Link
                            to={`/admin/customers?highlight=${uid}`}
                            className="inline-flex"
                          >
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] hover:bg-emerald-200">
                              ✓ Identified Customer
                            </Badge>
                          </Link>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-[10px]">
                            WhatsApp Guest
                          </Badge>
                        );
                      })()}
                      <span className="text-xs text-muted-foreground ml-auto">{formatTime(e.created_at)}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="text-xs">
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">{e.customer_name || "Guest"}</p>
                        {e.customer_email && <p className="text-muted-foreground">{e.customer_email}</p>}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Status</label>
                        <Select value={e.status || "open"} onValueChange={(v) => updateField(e.id, { status: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Follow-up</label>
                        <Input
                          type="date"
                          defaultValue={e.follow_up_at ? new Date(e.follow_up_at).toISOString().slice(0, 10) : ""}
                          onBlur={(ev) => updateField(e.id, { follow_up_at: ev.target.value ? new Date(ev.target.value).toISOString() : null })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <Button size="sm" variant="outline" onClick={() => togglePriority(e)} title="Toggle priority">
                          <Star className={`h-3.5 w-3.5 ${e.priority === "high" ? "fill-amber-400 text-amber-500" : ""}`} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => replyOnWhatsApp(e)} title="Reply on WhatsApp">
                          <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openView(e)} title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Admin notes…"
                      defaultValue={e.admin_notes || ""}
                      onBlur={(ev) => {
                        if ((ev.target.value || "") !== (e.admin_notes || "")) {
                          updateField(e.id, { admin_notes: ev.target.value || null });
                        }
                      }}
                      rows={1}
                      className="mt-2 text-xs resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Enquiry {viewing?.enquiry_ref || viewing?.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="text-sm">
                <p><span className="text-muted-foreground">Customer:</span> {viewing.customer_name || "Guest"}</p>
                {viewing.customer_email && <p><span className="text-muted-foreground">Email:</span> {viewing.customer_email}</p>}
                <p><span className="text-muted-foreground">Submitted:</span> {formatTime(viewing.created_at)}</p>
              </div>
              {items.length > 0 ? (
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Items</p>
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 text-sm">
                      {it.product_image && <img src={it.product_image} alt="" className="h-10 w-10 rounded object-cover" />}
                      <div className="flex-1">
                        <p className="font-medium">{it.product_name}</p>
                        {(it.selected_size || it.selected_colour) && (
                          <p className="text-xs text-muted-foreground">
                            {[it.selected_size, it.selected_colour].filter(Boolean).join(" • ")}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs">
                        {it.product_price != null && <p className="font-medium">{formatINR(it.product_price * it.quantity)}</p>}
                        <p className="text-muted-foreground">Qty {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground border-t border-border pt-3">
                  Single-product enquiry: <span className="font-medium">{viewing.product_name}</span>
                  {viewing.product_price != null && <> — {formatINR(Number(viewing.product_price))}</>}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnquiriesAdmin;

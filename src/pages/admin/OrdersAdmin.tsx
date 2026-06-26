import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Download,
  Package,
  Search,
  MessageCircle,
  Eye,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useAdminSettings } from "@/lib/queries";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type Order = {
  id: string;
  order_ref: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_pincode: string | null;
  subtotal: number;
  shipping_amount: number;
  total_amount: number;
  payment_status: string;
  payment_screenshot_url: string | null;
  payment_upi_ref: string | null;
  order_status: string;
  tracking_number: string | null;
  admin_notes: string | null;
  created_at: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_colour: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const ORDER_STATUS_OPTIONS = [
  { value: "placed",    label: "Order placed",     color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "confirmed", label: "Confirmed",        color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "processing",label: "Being packed",     color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "shipped",   label: "Out for delivery", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "delivered", label: "Delivered",        color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "cancelled", label: "Cancelled",        color: "bg-rose-100 text-rose-800 border-rose-300" },
];

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:             { label: "Waiting for payment",    color: "#92400E", bg: "#FEF3C7" },
  screenshot_uploaded: { label: "Screenshot received ✓", color: "#1E40AF", bg: "#DBEAFE" },
  confirmed:           { label: "Payment confirmed ✓",  color: "#065F46", bg: "#D1FAE5" },
  rejected:            { label: "Payment rejected",       color: "#991B1B", bg: "#FEE2E2" },
  refunded:            { label: "Refunded",               color: "#6B21A8", bg: "#F3E8FF" },
};

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  placed:    { label: "Order placed",     color: "#92400E", bg: "#FEF3C7", icon: "📋" },
  confirmed: { label: "Confirmed",        color: "#065F46", bg: "#D1FAE5", icon: "✅" },
  processing:{ label: "Being packed",     color: "#1E40AF", bg: "#DBEAFE", icon: "📦" },
  shipped:   { label: "Out for delivery", color: "#6B21A8", bg: "#F3E8FF", icon: "🚚" },
  delivered: { label: "Delivered",        color: "#065F46", bg: "#D1FAE5", icon: "🎉" },
  cancelled: { label: "Cancelled",        color: "#991B1B", bg: "#FEE2E2", icon: "❌" },
};

const statusMeta = (s: string) =>
  ORDER_STATUS_OPTIONS.find((o) => o.value === s) || ORDER_STATUS_OPTIONS[0];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const OrdersAdmin = () => {
  const qc = useQueryClient();
  const { data: settings } = useAdminSettings();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [screenshotOrder, setScreenshotOrder] = useState<Order | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as Order[];
    },
  });

  const { data: itemsByOrder = {} } = useQuery({
    queryKey: ["admin-order-items", orders.map((o) => o.id).join(",")],
    enabled: orders.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const ids = orders.map((o) => o.id);
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
      if (error) throw error;
      const map: Record<string, OrderItem[]> = {};
      (data as OrderItem[]).forEach((it) => {
        (map[it.order_id] ||= []).push(it);
      });
      return map;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = orders;
    if (tab === "pending_payment")
      list = list.filter(
        (o) => o.payment_status !== "confirmed" && o.order_status === "placed",
      );
    else if (tab !== "all")
      list = list.filter((o) => o.order_status === tab);
    if (q) {
      list = list.filter(
        (o) =>
          o.order_ref.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_phone.includes(q) ||
          o.customer_email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, search, tab]);

  const counts = useMemo(() => {
    const c = { all: orders.length, pending_payment: 0 } as Record<string, number>;
    ORDER_STATUS_OPTIONS.forEach((o) => (c[o.value] = 0));
    orders.forEach((o) => {
      c[o.order_status] = (c[o.order_status] || 0) + 1;
      if (o.payment_status !== "confirmed" && o.order_status === "placed")
        c.pending_payment++;
    });
    return c;
  }, [orders]);

  const updateOrder = async (id: string, patch: Partial<Order>) => {
    const { error } = await supabase.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const confirmPayment = (o: Order) =>
    updateOrder(o.id, { payment_status: "confirmed", order_status: "confirmed" });

  const rejectPayment = (o: Order) => {
    void updateOrder(o.id, { payment_status: "rejected" });
    const number = settings?.whatsapp_number?.replace(/\D/g, "");
    const customerNumber = o.customer_phone.replace(/\D/g, "");
    if (customerNumber) {
      const msg = `Hi ${o.customer_name}, regarding your Eraya order *${o.order_ref}* — we couldn't verify your payment screenshot. Please reach out so we can help.`;
      window.open(
        `https://wa.me/${customerNumber}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
    } else if (!number) {
      toast.info("Marked rejected. Contact customer manually.");
    }
  };

  const whatsAppCustomer = (o: Order) => {
    const num = o.customer_phone.replace(/\D/g, "");
    if (!num) return toast.error("No customer phone");
    const msg = `Hi ${o.customer_name}, regarding your Eraya order *${o.order_ref}*: `;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const viewScreenshot = async (o: Order) => {
    if (!o.payment_screenshot_url) return toast.info("No screenshot uploaded");
    setScreenshotOrder(o);
    setScreenshotUrl(null);
    setLoadingScreenshot(true);
    const { data, error } = await supabase.storage
      .from("payment-screenshots")
      .createSignedUrl(o.payment_screenshot_url, 3600);
    setLoadingScreenshot(false);
    if (error) return toast.error(error.message);
    setScreenshotUrl(data?.signedUrl || null);
  };

  const exportExcel = () => {
    if (!filtered.length) return toast.info("No orders to export.");
    const rows = filtered.map((o) => ({
      Date: formatTime(o.created_at),
      Ref: o.order_ref,
      Customer: o.customer_name,
      Phone: o.customer_phone,
      Email: o.customer_email,
      Address: [o.customer_address, o.customer_city, o.customer_state, o.customer_pincode]
        .filter(Boolean)
        .join(", "),
      Subtotal: o.subtotal,
      Shipping: o.shipping_amount,
      Total: o.total_amount,
      "Order Status": o.order_status,
      "Payment Status": o.payment_status,
      "UPI Ref": o.payment_upi_ref || "",
      Tracking: o.tracking_number || "",
      Notes: o.admin_notes || "",
      Items: (itemsByOrder[o.id] || [])
        .map(
          (i) =>
            `${i.product_name} x${i.quantity}${i.variant_size ? ` (${i.variant_size})` : ""}`,
        )
        .join(" | "),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `eraya-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Verify payments, update status, and ship orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 border-gold/40">
            <Package className="h-3 w-3" /> {orders.length} total
          </Badge>
          {counts.pending_payment > 0 && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
              {counts.pending_payment} pending payment
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto justify-start no-scrollbar">
          <TabsTrigger value="all" className="shrink-0">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending_payment" className="shrink-0">
            Pending Payment ({counts.pending_payment})
          </TabsTrigger>
          {ORDER_STATUS_OPTIONS.filter((o) => o.value !== "placed").map((o) => (
            <TabsTrigger key={o.value} value={o.value} className="shrink-0">
              {o.label} ({counts[o.value] || 0})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Orders</CardTitle>
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
                placeholder="Search ref, name, phone, or email"
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Loading orders…</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No orders match.
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((o) => {
                  const meta = statusMeta(o.order_status);
                  const items = itemsByOrder[o.id] || [];
                  return (
                    <div
                      key={o.id}
                      className="border border-border rounded-md p-3 hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {o.order_ref}
                        </Badge>
                        <Badge variant="outline" className={`${meta.color} text-[10px]`}>
                          {meta.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{
                            backgroundColor: PAYMENT_STATUS_LABELS[o.payment_status]?.bg || "#FEF3C7",
                            color: PAYMENT_STATUS_LABELS[o.payment_status]?.color || "#92400E",
                            borderColor: PAYMENT_STATUS_LABELS[o.payment_status]?.bg || "#FEF3C7",
                          }}
                        >
                          {PAYMENT_STATUS_LABELS[o.payment_status]?.label || o.payment_status}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatTime(o.created_at)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <p className="text-muted-foreground">Customer</p>
                          <p className="font-medium">{o.customer_name}</p>
                          <p className="text-muted-foreground">{o.customer_phone}</p>
                          <p className="text-muted-foreground truncate">{o.customer_email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Address</p>
                          <p>
                            {o.customer_address}
                            <br />
                            {o.customer_city}, {o.customer_state} {o.customer_pincode}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Breakdown</p>
                          <div className="space-y-0.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>₹{Number(o.subtotal || 0).toLocaleString("en-IN")}</span>
                            </div>
                            {Number((settings as any)?.packing_cost ?? 0) > 0 && (
                              <div className="flex justify-between text-amber-600">
                                <span>Packing (internal)</span>
                                <span>₹{Number((settings as any).packing_cost).toLocaleString("en-IN")}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping</span>
                              <span>₹{Number(o.shipping_amount || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-sm text-foreground border-t pt-1 mt-1">
                              <span>Total</span>
                              <span>₹{o.total_amount.toLocaleString("en-IN")}</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {items.length} item{items.length !== 1 ? "s" : ""}
                            {o.payment_upi_ref && ` · UPI ${o.payment_upi_ref}`}
                          </p>
                        </div>
                      </div>

                      {items.length > 0 && (
                        <div className="text-xs text-muted-foreground mb-3 border-l-2 border-muted pl-2 space-y-0.5">
                          {items.map((i) => (
                            <p key={i.id}>
                              • {i.product_name}
                              {i.variant_size && ` (${i.variant_size})`} ×{i.quantity} —
                              ₹{i.total_price.toLocaleString("en-IN")}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Update Order Status
                          </label>
                          <Select
                            value={o.order_status}
                            onValueChange={(v) => updateOrder(o.id, { order_status: v })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">
                            Tracking Number
                          </label>
                          <Input
                            defaultValue={o.tracking_number || ""}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v !== (o.tracking_number || ""))
                                updateOrder(o.id, { tracking_number: v || null });
                            }}
                            placeholder="e.g. DTDC1234567"
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <Textarea
                        placeholder="Admin notes…"
                        defaultValue={o.admin_notes || ""}
                        onBlur={(e) => {
                          if ((e.target.value || "") !== (o.admin_notes || ""))
                            updateOrder(o.id, { admin_notes: e.target.value || null });
                        }}
                        rows={1}
                        className="text-xs resize-none mb-2"
                      />

                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewScreenshot(o)}
                          disabled={!o.payment_screenshot_url}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Payment Photo
                        </Button>
                        {o.payment_status !== "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => confirmPayment(o)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> ✅ Yes, Payment Received
                          </Button>
                        )}
                        {o.payment_status !== "rejected" &&
                          o.payment_status !== "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectPayment(o)}
                              className="text-rose-600 border-rose-300 hover:bg-rose-50"
                            >
                              <X className="h-3.5 w-3.5 mr-1" /> ❌ Payment Not Found
                            </Button>
                          )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => whatsAppCustomer(o)}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1 text-green-600" />{" "}
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!screenshotOrder}
        onOpenChange={(o) => {
          if (!o) {
            setScreenshotOrder(null);
            setScreenshotUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Payment Photo — {screenshotOrder?.order_ref}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {loadingScreenshot ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground my-12" />
            ) : screenshotUrl ? (
              <img
                src={screenshotUrl}
                alt="Payment photo"
                className="max-h-[70vh] rounded-lg"
              />
            ) : (
              <p className="text-sm text-muted-foreground py-12">No payment photo uploaded</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersAdmin;

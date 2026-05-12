import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Inbox, Search } from "lucide-react";
import { formatINR } from "@/lib/queries";
import { toast } from "sonner";
import * as XLSX from "xlsx";

type Enquiry = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_price: number | null;
  customer_email: string | null;
  customer_name: string | null;
  created_at: string;
};

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

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EnquiriesAdmin = () => {
  const { data: enquiries = [], isLoading } = useEnquiries();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enquiries;
    return enquiries.filter(
      (e) =>
        e.product_name.toLowerCase().includes(q) ||
        (e.customer_email ?? "").toLowerCase().includes(q) ||
        (e.customer_name ?? "").toLowerCase().includes(q),
    );
  }, [enquiries, search]);

  const exportExcel = () => {
    if (!filtered.length) {
      toast.info("No enquiries to export.");
      return;
    }
    const rows = filtered.map((e) => ({
      Date: formatTime(e.created_at),
      Product: e.product_name,
      Price: e.product_price ?? "",
      Customer: e.customer_name ?? "Guest",
      Email: e.customer_email ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");
    XLSX.writeFile(wb, `eraya-enquiries-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Enquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Every "I Love It" click from the storefront is logged here.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 border-gold/40">
          <Inbox className="h-3 w-3" /> {enquiries.length} total
        </Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle>All enquiries</CardTitle>
            <CardDescription>Most recent first. Search by product or customer.</CardDescription>
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
              placeholder="Search product, name, or email"
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading enquiries…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No enquiries yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Time</th>
                    <th className="text-left px-3 py-2">Product</th>
                    <th className="text-right px-3 py-2">Price</th>
                    <th className="text-left px-3 py-2">Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                        {formatTime(e.created_at)}
                      </td>
                      <td className="px-3 py-2 font-medium">{e.product_name}</td>
                      <td className="px-3 py-2 text-right">
                        {e.product_price != null ? formatINR(Number(e.product_price)) : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {e.customer_name || e.customer_email ? (
                          <>
                            <div>{e.customer_name ?? "—"}</div>
                            <div className="text-muted-foreground">{e.customer_email ?? ""}</div>
                          </>
                        ) : (
                          <span className="italic text-muted-foreground">Guest</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnquiriesAdmin;

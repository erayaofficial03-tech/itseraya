import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useProducts } from "@/lib/queries";
import { confirm } from "@/components/ui/confirm-dialog";

type Filter = "all" | "pending" | "approved" | "hidden" | "fake";

const StarPick = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className="text-2xl leading-none"
      >
        <span className={s <= value ? "text-[#C9A84C]" : "text-muted-foreground/30"}>★</span>
      </button>
    ))}
  </div>
);

const ReviewsManager = () => {
  const qc = useQueryClient();
  const { data: products = [] } = useProducts();
  const [filter, setFilter] = useState<Filter>("all");
  const [hideTarget, setHideTarget] = useState<any>(null);
  const [hideReason, setHideReason] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    customer_name: "",
    customer_city: "",
    rating: 5,
    review_text: "",
    autoApprove: true,
    verified: true,
  });

  const { data: reviews = [], refetch } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const invalidate = () => {
    refetch();
    qc.invalidateQueries({ queryKey: ["product-ratings"] });
    qc.invalidateQueries({ queryKey: ["featured-reviews"] });
    qc.invalidateQueries({ queryKey: ["aggregate-reviews"] });
  };

  const filtered = reviews.filter((r: any) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved && !r.is_hidden;
    if (filter === "hidden") return r.is_hidden;
    if (filter === "fake") return r.is_fake;
    return true;
  });

  const update = async (id: string, patch: Record<string, any>) => {
    const { error } = await supabase.from("reviews").update(patch as any).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      invalidate();
    }
  };

  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete this review?", description: "This action is permanent and cannot be undone." }))) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      invalidate();
    }
  };

  const confirmHide = async () => {
    const { data: u } = await supabase.auth.getUser();
    await update(hideTarget.id, {
      is_hidden: true,
      hidden_by: u.user?.id ?? null,
      hidden_at: new Date().toISOString(),
      hide_reason: hideReason || null,
    });
    setHideTarget(null);
    setHideReason("");
  };

  const createReview = async () => {
    if (!form.product_id) return toast.error("Pick a product");
    if (!form.customer_name.trim()) return toast.error("Name required");
    if (form.review_text.trim().length < 5) return toast.error("Review too short");
    const product = products.find((p) => p.id === form.product_id);
    const { error } = await supabase.from("reviews").insert({
      product_id: form.product_id,
      product_name: product?.name ?? null,
      customer_name: form.customer_name.trim(),
      customer_city: form.customer_city.trim() || null,
      rating: form.rating,
      review_text: form.review_text.trim(),
      is_approved: form.autoApprove,
      is_fake: true,
      is_hidden: false,
      reviewer_user_id: null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Review created");
    setCreateOpen(false);
    setForm({
      product_id: "",
      customer_name: "",
      customer_city: "",
      rating: 5,
      review_text: "",
      autoApprove: true,
      verified: true,
    });
    invalidate();
  };

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "hidden", label: "Hidden" },
    { key: "fake", label: "Admin Created" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                filter === t.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ Add Review</Button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No reviews in this view.</p>
        )}
        {filtered.map((r: any) => (
          <div
            key={r.id}
            className="p-4 border rounded-lg bg-background flex flex-col md:flex-row gap-3 md:items-start md:justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="font-medium text-foreground">{r.customer_name}</span>
                {r.customer_city && <span>· {r.customer_city}</span>}
                <span>· {new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-[#C9A84C] text-sm">
                {"★".repeat(r.rating)}
                <span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Product: {r.product_name || products.find((p) => p.id === r.product_id)?.name || "—"}
              </p>
              <p className="text-sm mt-2">{r.review_text}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {!r.is_approved && (
                  <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                )}
                {r.is_approved && !r.is_hidden && (
                  <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Approved
                  </span>
                )}
                {r.is_hidden && (
                  <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                    Hidden{r.hide_reason ? `: ${r.hide_reason}` : ""}
                  </span>
                )}
                {r.is_featured && (
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
                {r.is_fake && (
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col md:w-40">
              <Button
                size="sm"
                variant={r.is_approved ? "outline" : "default"}
                onClick={() => update(r.id, { is_approved: !r.is_approved })}
              >
                {r.is_approved ? "Unapprove" : "Approve"}
              </Button>
              {r.is_hidden ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update(r.id, {
                      is_hidden: false,
                      hidden_by: null,
                      hidden_at: null,
                      hide_reason: null,
                    })
                  }
                >
                  Unhide
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setHideTarget(r)}>
                  Hide
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(r.id, { is_featured: !r.is_featured })}
              >
                {r.is_featured ? "Unfeature" : "Feature"}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Hide dialog */}
      <Dialog open={!!hideTarget} onOpenChange={(o) => !o && setHideTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hide review</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input value={hideReason} onChange={(e) => setHideReason(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Hidden reviews won't appear publicly or count toward the average. The reviewer can
              still see it.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHideTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmHide}>Hide</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Product</Label>
              <Select
                value={form.product_id}
                onValueChange={(v) => setForm({ ...form, product_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Customer name</Label>
                <Input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={form.customer_city}
                  onChange={(e) => setForm({ ...form, customer_city: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email (optional)</Label>
              <Input
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              />
            </div>
            <div>
              <Label>Rating</Label>
              <StarPick value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
            </div>
            <div>
              <Label>Review text</Label>
              <Textarea
                rows={4}
                value={form.review_text}
                onChange={(e) => setForm({ ...form, review_text: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto-approve</Label>
              <Switch
                checked={form.autoApprove}
                onCheckedChange={(v) => setForm({ ...form, autoApprove: v })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Marked as admin-created internally but shown as a regular review publicly.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createReview}>Save Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsManager;

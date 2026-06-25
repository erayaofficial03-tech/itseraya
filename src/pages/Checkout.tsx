import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Copy, Upload, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CheckoutHeader from "../components/header/CheckoutHeader";
import Footer from "../components/footer/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartContext } from "@/components/providers/CartProvider";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { INDIAN_STATES } from "@/lib/indianStates";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { data: settingsData } = useSettings();
  const settings = settingsData as any;
  const [payment, setPayment] = useState<{ upi_id: string | null; upi_name: string | null; upi_qr_url: string | null } | null>(null);
  const { cartItems, subtotal, updateQty, removeFromCart, clearCart, cartCount } =
    useCartContext();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [upiRef, setUpiRef] = useState("");
  const [placing, setPlacing] = useState(false);

  // Guest redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Pre-fill once profile/user is available
  useEffect(() => {
    setForm((f) => ({
      ...f,
      name: f.name || profile?.full_name || "",
      email: f.email || user?.email || "",
      phone: f.phone || profile?.phone || "",
      city: f.city || profile?.city || "",
      state: f.state || profile?.state || "",
    }));
  }, [user, profile]);

  // Redirect away if cart empty (only after mount; allow brief loading)
  useEffect(() => {
    if (cartCount === 0 && !placing) {
      // Allow empty after placing; otherwise nudge user
    }
  }, [cartCount, placing]);

  const freeMin = Number(settings?.shipping_free_above ?? settings?.shipping_free_min_order ?? 999);
  const flatShipping = Number(settings?.shipping_charge ?? settings?.shipping_flat_cost ?? 95);
  const shippingCharge = subtotal >= freeMin || subtotal === 0 ? 0 : flatShipping;
  const total = subtotal + shippingCharge;

  const upiId = settings?.upi_id || "";
  const upiQr = settings?.upi_qr_url || "";
  const upiName = settings?.upi_name || "Eraya";

  const updateField = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    if (!user) {
      toast.error("Please log in to checkout");
      navigate("/login?redirect=/checkout");
      return false;
    }
    const required: (keyof typeof form)[] = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "pincode",
    ];
    for (const k of required) {
      if (!form[k]?.trim()) {
        toast.error(`Please enter your ${k}`);
        return false;
      }
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Pincode must be 6 digits");
      return false;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      toast.error("Enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("payment-screenshots")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      setScreenshotUrl(path);
      toast.success("Screenshot uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const copyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied!");
  };

  const generateOrderRef = () => {
    const d = new Date();
    const yy = d.getFullYear().toString().slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `ERA-${yy}${mm}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const notifyAdmin = (orderRef: string) => {
    const number = settings?.whatsapp_number?.replace(/\D/g, "");
    if (!number) return;
    const lines = [
      `🛒 *New Order Received*`,
      `Ref: *${orderRef}*`,
      `Customer: ${form.name}`,
      `Phone: ${form.phone}`,
      `Total: ₹${total.toLocaleString("en-IN")}`,
      ``,
      `Items:`,
      ...cartItems.map(
        (i) =>
          `• ${i.product_name}${i.variant_size ? ` (${i.variant_size})` : ""} x${i.quantity}`,
      ),
    ];
    const url = `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!screenshotUrl) {
      toast.error("Please upload payment screenshot");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setPlacing(true);
    const orderRef = generateOrderRef();
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          order_ref: orderRef,
          customer_id: user.id,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          customer_address: form.address,
          customer_city: form.city,
          customer_state: form.state,
          customer_pincode: form.pincode,
          subtotal,
          shipping_amount: shippingCharge,
          total_amount: total,
          payment_screenshot_url: screenshotUrl,
          payment_upi_ref: upiRef || null,
          payment_status: "screenshot_uploaded",
          order_status: "placed",
        })
        .select()
        .single();

      if (error || !order) throw error || new Error("Failed to create order");

      const { error: itemsError } = await supabase.from("order_items").insert(
        cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image_url: item.product_image_url,
          variant_size: item.variant_size,
          variant_colour: item.variant_colour,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity,
        })),
      );
      if (itemsError) throw itemsError;

      await clearCart();
      notifyAdmin(orderRef);
      toast.success("Order placed!");
      navigate(`/order-confirmed/${orderRef}`);
    } catch (err: any) {
      toast.error(err.message || "Order failed. Please try again.");
      setPlacing(false);
    }
  };

  if (cartCount === 0 && !placing) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add something beautiful to checkout.
          </p>
          <Button onClick={() => navigate("/catalogue")} className="rounded-full">
            Continue Shopping
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />

      <main className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2].map((n) => (
              <div key={n} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= n
                      ? "bg-[#C9A84C] text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > n ? <Check className="h-4 w-4" /> : n}
                </div>
                <span
                  className={`text-sm ${step >= n ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {n === 1 ? "Delivery" : "Payment"}
                </span>
                {n === 1 && <div className="w-12 h-px bg-muted-foreground/30 ml-2" />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-muted/20 p-6 sticky top-6">
                <h2 className="text-lg font-light text-foreground mb-6">Order Summary</h2>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-muted overflow-hidden flex-shrink-0">
                        {item.product_image_url && (
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-light text-foreground truncate">
                          {item.product_name}
                        </h3>
                        {(item.variant_size || item.variant_colour) && (
                          <p className="text-xs text-muted-foreground">
                            {[item.variant_size, item.variant_colour]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-xs min-w-[2ch] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        ₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-muted-foreground/20 mt-6 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shippingCharge === 0
                        ? "Free"
                        : `₹${shippingCharge.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-muted-foreground/20">
                    <span>Total</span>
                    <span className="text-[#C9A84C]">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forms */}
            <div className="lg:col-span-2 lg:order-1 space-y-6">
              {step === 1 && (
                <div className="bg-muted/20 p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-light text-foreground">Delivery Details</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Phone *</Label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="mt-2"
                        placeholder="10-digit mobile"
                      />
                    </div>
                    <div>
                      <Label>Pincode *</Label>
                      <Input
                        value={form.pincode}
                        onChange={(e) => updateField("pincode", e.target.value)}
                        className="mt-2"
                        maxLength={6}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address *</Label>
                      <Input
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        className="mt-2"
                        placeholder="House no, street, area, landmark"
                      />
                    </div>
                    <div>
                      <Label>City *</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>State *</Label>
                      <select
                        value={form.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select state</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={() => validateStep1() && setStep(2)}
                    className="w-full bg-[#C9A84C] hover:bg-[#b89640] text-white rounded-full"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-muted/20 p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-light text-foreground">Payment</h2>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm underline text-muted-foreground"
                    >
                      Edit details
                    </button>
                  </div>

                  <div className="bg-background p-6 rounded-lg text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Pay <span className="font-bold text-[#C9A84C]">₹{total.toLocaleString("en-IN")}</span>{" "}
                      to <strong>{upiName}</strong>
                    </p>

                    {upiQr ? (
                      <img
                        src={upiQr}
                        alt="UPI QR Code"
                        className="w-48 h-48 mx-auto rounded-xl object-contain border border-muted-foreground/20"
                      />
                    ) : (
                      <div className="w-48 h-48 mx-auto rounded-xl bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        QR not configured
                      </div>
                    )}

                    {upiId && (
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-muted-foreground">UPI ID:</span>
                        <strong className="text-foreground">{upiId}</strong>
                        <button
                          onClick={copyUpi}
                          className="p-1 hover:bg-muted rounded"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Payment Screenshot *</Label>
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 cursor-pointer hover:border-[#C9A84C] transition-colors">
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : screenshotUrl ? (
                        <>
                          <Check className="h-6 w-6 text-green-600" />
                          <span className="text-sm text-green-600">
                            Screenshot uploaded
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Click to replace
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload screenshot
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Max 5MB · JPG, PNG
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <Label>UPI Transaction ID (optional)</Label>
                    <Input
                      value={upiRef}
                      onChange={(e) => setUpiRef(e.target.value)}
                      className="mt-2"
                      placeholder="e.g. 1234567890XX"
                    />
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placing || uploading || !screenshotUrl}
                    className="w-full bg-[#C9A84C] hover:bg-[#b89640] text-white rounded-full"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Placing order...
                      </>
                    ) : (
                      `Place Order · ₹${total.toLocaleString("en-IN")}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {settings?.order_confirmation_message ||
                      "We will verify your payment and confirm your order shortly."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;

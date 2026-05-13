import PolicyPage from "@/components/PolicyPage";
import { useSettings } from "@/lib/queries";

const ShippingPolicy = () => {
  const { data: settings } = useSettings();
  const sx = (settings as unknown as Record<string, string | undefined>) ?? {};
  return (
    <PolicyPage
      title={sx.policy_shipping_title || "Shipping Policy"}
      body={
        sx.policy_shipping_body ||
        "We ship across India within 5-7 business days. Free shipping on orders above ₹999. Express delivery available on request."
      }
    />
  );
};

export default ShippingPolicy;

import PolicyPage from "@/components/PolicyPage";
import { useSettings } from "@/lib/queries";

const ReturnPolicy = () => {
  const { data: settings } = useSettings();
  const sx = (settings as unknown as Record<string, string | undefined>) ?? {};
  return (
    <PolicyPage
      title={sx.policy_return_title || "Return Policy"}
      body={
        sx.policy_return_body ||
        "We accept returns within 7 days of delivery. Items must be unused and in original packaging. Contact us on WhatsApp to initiate a return."
      }
    />
  );
};

export default ReturnPolicy;

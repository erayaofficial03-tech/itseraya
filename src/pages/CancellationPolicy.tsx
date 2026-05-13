import PolicyPage from "@/components/PolicyPage";
import { useSettings } from "@/lib/queries";

const CancellationPolicy = () => {
  const { data: settings } = useSettings();
  const sx = (settings as unknown as Record<string, string | undefined>) ?? {};
  return (
    <PolicyPage
      title={sx.policy_cancellation_title || "Cancellation Policy"}
      body={
        sx.policy_cancellation_body ||
        "Orders can be cancelled within 24 hours of placing the enquiry. Contact us immediately on WhatsApp to cancel."
      }
    />
  );
};

export default CancellationPolicy;

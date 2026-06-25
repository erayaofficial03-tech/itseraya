import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import PolicyPage from "@/components/PolicyPage";

const PrivacyPolicy = () => {
  const { data: settings } = useSettings();
  return (
    <PolicyPage
      title={s(settings, "policy_privacy_title")}
      body={s(settings, "policy_privacy_body")}
    />
  );
};

export default PrivacyPolicy;

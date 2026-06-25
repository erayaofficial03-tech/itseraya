import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import PolicyPage from "@/components/PolicyPage";

const TermsOfService = () => {
  const { data: settings } = useSettings();
  return (
    <PolicyPage
      title={s(settings, "policy_terms_title")}
      body={s(settings, "policy_terms_body")}
    />
  );
};

export default TermsOfService;

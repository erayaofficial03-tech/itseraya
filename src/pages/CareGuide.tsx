import PolicyPage from "@/components/PolicyPage";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";

const CareGuide = () => {
  const { data: settings } = useSettings();
  return (
    <PolicyPage
      title={s(settings, "care_guide_title")}
      body={s(settings, "care_guide_body")}
    />
  );
};

export default CareGuide;

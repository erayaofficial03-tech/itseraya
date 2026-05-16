import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const WEIGHTS = [
  { label: "Light", value: "300" },
  { label: "Regular", value: "normal" },
  { label: "Medium", value: "500" },
  { label: "SemiBold", value: "semibold" },
  { label: "Bold", value: "bold" },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}

export const FontWeightPicker = ({ value, onChange, label = "Weight" }: Props) => (
  <div>
    <Label className="text-xs mb-1.5 block">{label}</Label>
    <div className="flex flex-wrap gap-1">
      {WEIGHTS.map((w) => (
        <button
          key={w.value}
          type="button"
          onClick={() => onChange(w.value)}
          className={cn(
            "px-2.5 py-1 text-[11px] rounded-full border transition-colors",
            value === w.value
              ? "bg-[#C9A84C] text-white border-[#C9A84C]"
              : "bg-background border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {w.label}
        </button>
      ))}
    </div>
  </div>
);

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
} from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  axis?: "h" | "v";
}

export const AlignPicker = ({ label, value, onChange, axis = "h" }: Props) => {
  const options =
    axis === "h"
      ? [
          { v: "left", Icon: AlignLeft },
          { v: "center", Icon: AlignCenter },
          { v: "right", Icon: AlignRight },
        ]
      : [
          { v: "top", Icon: AlignStartVertical },
          { v: "center", Icon: AlignCenterVertical },
          { v: "bottom", Icon: AlignEndVertical },
        ];
  return (
    <div>
      <Label className="text-xs mb-1.5 block">{label}</Label>
      <div className="inline-flex rounded-md border border-border overflow-hidden">
        {options.map(({ v, Icon }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "p-2 transition-colors",
              value === v ? "bg-[#C9A84C] text-white" : "bg-background hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
};

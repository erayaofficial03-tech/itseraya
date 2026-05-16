import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const RangeSlider = ({ label, value, onChange, min = 0, max = 100, step = 1, unit = "" }: Props) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <Label className="text-xs">{label}</Label>
      <span className="text-xs text-muted-foreground tabular-nums">
        {value}{unit}
      </span>
    </div>
    <Slider min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])} />
  </div>
);

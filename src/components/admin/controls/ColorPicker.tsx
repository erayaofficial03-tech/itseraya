import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RangeSlider } from "./RangeSlider";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
}

export const ColorPicker = ({ label, value, onChange, opacity, onOpacityChange }: Props) => (
  <div className="space-y-2">
    <Label className="text-xs">{label}</Label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value.startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 rounded border border-border cursor-pointer bg-transparent"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 font-mono text-xs"
      />
    </div>
    {onOpacityChange !== undefined && opacity !== undefined && (
      <RangeSlider label="Opacity" value={opacity} onChange={onOpacityChange} min={0} max={100} unit="%" />
    )}
  </div>
);

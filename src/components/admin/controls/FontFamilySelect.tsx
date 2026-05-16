import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const FONT_FAMILIES = [
  "Playfair Display",
  "Inter",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Montserrat",
  "Cormorant Garamond",
  "Lora",
];

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export const FontFamilySelect = ({ label, value, onChange }: Props) => (
  <div>
    <Label className="text-xs mb-1.5 block">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9">
        <SelectValue style={{ fontFamily: value }} />
      </SelectTrigger>
      <SelectContent>
        {FONT_FAMILIES.map((f) => (
          <SelectItem key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

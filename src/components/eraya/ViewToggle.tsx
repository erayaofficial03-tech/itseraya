import { useEffect, useState } from "react";
import { LayoutGrid, List } from "lucide-react";

export type ViewMode = "grid" | "list";
const KEY = "eraya:view-mode";

export const useViewMode = (): [ViewMode, (m: ViewMode) => void] => {
  const [mode, setModeState] = useState<ViewMode>("grid");
  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "grid" || v === "list") setModeState(v);
    } catch {}
  }, []);
  const setMode = (m: ViewMode) => {
    setModeState(m);
    try { localStorage.setItem(KEY, m); } catch {}
  };
  return [mode, setMode];
};

interface Props {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
  className?: string;
}

const ViewToggle = ({ mode, onChange, className = "" }: Props) => (
  <div className={`inline-flex border border-border rounded-full overflow-hidden ${className}`}>
    <button
      type="button"
      aria-label="Grid view"
      onClick={() => onChange("grid")}
      className={`h-8 w-9 flex items-center justify-center transition-colors ${
        mode === "grid" ? "bg-charcoal text-white" : "bg-background text-foreground hover:text-gold"
      }`}
    >
      <LayoutGrid className="h-4 w-4" />
    </button>
    <button
      type="button"
      aria-label="List view"
      onClick={() => onChange("list")}
      className={`h-8 w-9 flex items-center justify-center transition-colors ${
        mode === "list" ? "bg-charcoal text-white" : "bg-background text-foreground hover:text-gold"
      }`}
    >
      <List className="h-4 w-4" />
    </button>
  </div>
);

export default ViewToggle;

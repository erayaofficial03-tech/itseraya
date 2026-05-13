import { createContext, useContext, useState, ReactNode } from "react";
import EnquiryCartDrawer from "./EnquiryCartDrawer";

interface Ctx {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const EnquiryCartCtx = createContext<Ctx | null>(null);

export const useEnquiryCartUI = () => {
  const ctx = useContext(EnquiryCartCtx);
  if (!ctx) throw new Error("useEnquiryCartUI must be used inside EnquiryCartProvider");
  return ctx;
};

export const EnquiryCartProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <EnquiryCartCtx.Provider
      value={{ open, openCart: () => setOpen(true), closeCart: () => setOpen(false) }}
    >
      {children}
      <EnquiryCartDrawer open={open} onOpenChange={setOpen} />
    </EnquiryCartCtx.Provider>
  );
};

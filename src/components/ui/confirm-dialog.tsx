import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Options = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type Request = Options & { resolve: (v: boolean) => void };

let emit: ((req: Request) => void) | null = null;

/**
 * Branded replacement for native window.confirm().
 * Never leaks the host URL like the browser dialog does.
 *
 * Usage: if (!(await confirm({ title: "Delete?" }))) return;
 */
export const confirm = (opts: Options = {}): Promise<boolean> =>
  new Promise((resolve) => {
    if (!emit) {
      // Fallback: if root isn't mounted yet, resolve false to be safe.
      resolve(false);
      return;
    }
    emit({ ...opts, resolve });
  });

export const ConfirmDialogRoot = () => {
  const [req, setReq] = useState<Request | null>(null);

  useEffect(() => {
    emit = (r) => setReq(r);
    return () => {
      emit = null;
    };
  }, []);

  const close = (value: boolean) => {
    req?.resolve(value);
    setReq(null);
  };

  const destructive = req?.destructive ?? true;

  return (
    <AlertDialog open={!!req} onOpenChange={(o) => { if (!o) close(false); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{req?.title ?? "Are you sure?"}</AlertDialogTitle>
          {req?.description && (
            <AlertDialogDescription>{req.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>
            {req?.cancelText ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => close(true)}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
          >
            {req?.confirmText ?? "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

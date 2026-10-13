import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface DialogContextValue {
  open: boolean;
  onClose: () => void;
}

const DialogContext = createContext<
  DialogContextValue | undefined
>(undefined);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used inside Dialog");
  }
  return ctx;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const value = useMemo(() => ({ open, onClose }), [open, onClose]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={value}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative z-10 w-full max-w-lg animate-[fadeIn_.15s_ease-out">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

interface DialogContentProps {
  className?: string;
  children: ReactNode;
  showClose?: boolean;
}

export function DialogContent({
  className,
  children,
  showClose = true,
}: DialogContentProps) {
  const { onClose } = useDialog();
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-xl",
        className,
      )}
    >
      {showClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  title: ReactNode;
  description?: ReactNode;
}

export function DialogHeader({
  title,
  description,
}: DialogHeaderProps) {
  return (
    <div className="mb-4 pr-8 space-y-1.5">
      {typeof title === "string" ? (
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
      ) : (
        title
      )}
      {description && (
        <p className="text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex items-center justify-end gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

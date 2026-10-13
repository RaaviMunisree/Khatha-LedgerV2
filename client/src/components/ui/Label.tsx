import type { LabelHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-slate-700",
        className,
      )}
      {...props}
    />
  );
}

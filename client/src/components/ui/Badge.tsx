import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "slate";

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-slate-900 text-white",
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  warning:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  danger:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  info: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
  slate:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

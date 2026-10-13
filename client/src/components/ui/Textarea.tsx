import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { Label } from "./Label";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className,
  rows = 3,
  ...props
}: TextareaProps) {
  const textId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={textId}>{label}</Label>}
      <textarea
        id={textId}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

import type {
  OptionHTMLAttributes,
  SelectHTMLAttributes,
} from "react";
import { cn } from "../../lib/utils";
import { Label } from "./Label";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export function Select({
  label,
  error,
  className,
  id,
  options = [],
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <select
        id={selectId}
        className={cn(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
        className,
      )}
        {...props}
      >
        {children ??
          options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          disabled={opt.disabled}
        >
          {opt.label}
        </option>
      ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export { type OptionHTMLAttributes };

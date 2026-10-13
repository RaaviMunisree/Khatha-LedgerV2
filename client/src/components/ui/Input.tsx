import { Label } from "./Label";
import { cn } from "../../lib/utils";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  id,
  className,
  leftIcon,
  rightIcon,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <div
        className={cn(
          "flex items-center rounded-lg border border-slate-300 bg-white transition focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200",
          error &&
            "border-red-400 focus-within:border-red-500 focus-within:ring-red-200",
        )}
      >
        {leftIcon && (
          <span className="pl-3 text-slate-500">{leftIcon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400",
            leftIcon && "pl-0",
            rightIcon && "pr-0",
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="pr-3 text-slate-500">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

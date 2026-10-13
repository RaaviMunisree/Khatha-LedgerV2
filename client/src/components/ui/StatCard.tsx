import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import {
  ArrowDownIcon,
  ArrowRightLeft,
  ArrowUpRight,
  CreditCard,
  IndianRupee,
  Package,
  Users,
  FileText,
  BookOpen,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Settings2,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: {
    type: "up" | "down" | "flat";
    value: string;
  };
  icon?:
    | "customers"
    | "revenue"
    | "outstanding"
    | "sales"
    | "products"
    | "invoices"
    | "payments"
    | "ledger"
    | string;
  hint?: ReactNode;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  customers: Users,
  revenue: IndianRupee,
  outstanding: CreditCard,
  sales: ArrowUpRight,
  products: Package,
  invoices: FileText,
  payments: ArrowRightLeft,
  ledger: BookOpen,
  dashboard: LayoutDashboard,
  reports: LineChart,
  ai: Sparkles,
  settings: Settings2,
};

export function StatCard({
  label,
  value,
  delta,
  icon = "dashboard",
  hint,
  className,
}: StatCardProps) {
  const Icon = iconMap[icon] ?? LayoutDashboard;
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
          {delta && (
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                delta.type === "up" &&
                  "text-emerald-600",
                delta.type === "down" && "text-red-600",
                delta.type === "flat" && "text-slate-500",
              )}
            >
              {delta.type === "up" && (
                <ArrowUpRight className="h-3.5 w-3.5" />
              )}
              {delta.type === "down" && (
                <ArrowDownIcon className="h-3.5 w-3.5" />
              )}
              <span>{delta.value}</span>
            </div>
          )}
          {hint ?? null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Package,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

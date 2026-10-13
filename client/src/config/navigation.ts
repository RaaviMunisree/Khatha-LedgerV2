import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  CreditCard,
  BookOpenCheck,
  BarChart3,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  group?: "core" | "finance" | "insights";
}

export const ownerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/owner/dashboard",
    icon: LayoutDashboard,
    group: "core",
  },
  {
    label: "Customers",
    to: "/owner/customers",
    icon: Users,
    group: "core",
  },
  {
    label: "Products",
    to: "/owner/products",
    icon: Package,
    group: "core",
  },
  {
    label: "Inventory",
    to: "/owner/inventory",
    icon: Warehouse,
    group: "core",
  },
  {
    label: "Sales & Invoices",
    to: "/owner/invoices",
    icon: FileText,
    group: "finance",
  },
  {
    label: "Payments",
    to: "/owner/payments",
    icon: CreditCard,
    group: "finance",
  },
  {
    label: "Ledger",
    to: "/owner/ledger",
    icon: BookOpenCheck,
    group: "finance",
  },
  {
    label: "Reports",
    to: "/owner/reports",
    icon: BarChart3,
    group: "insights",
  },
  {
    label: "AI Assistant",
    to: "/owner/ai",
    icon: Sparkles,
    group: "insights",
  },
  {
    label: "Settings",
    to: "/owner/settings",
    icon: Settings,
  },
];

export const customerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/customer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Invoices",
    to: "/customer/invoices",
    icon: FileText,
  },
  {
    label: "Payments",
    to: "/customer/payments",
    icon: CreditCard,
  },
  {
    label: "Ledger",
    to: "/customer/ledger",
    icon: BookOpenCheck,
  },
  {
    label: "AI Assistant",
    to: "/customer/ai",
    icon: Sparkles,
  },
  {
    label: "Settings",
    to: "/customer/settings",
    icon: Settings,
  },
];

export const navGroupLabels: Record<string, string> = {
  core: "Core",
  finance: "Finance",
  insights: "Insights",
};

import { Link } from "react-router-dom";
import { LayoutDashboard, FileText, CreditCard, BookOpenCheck, Sparkles, Settings } from "lucide-react";

import Button from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { StatCard } from "../../../components/ui/StatCard";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hi, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's a quick look at your account with KhataX.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Outstanding" value="₹0" icon="outstanding" />
        <StatCard label="Total purchases" value="0" icon="invoices" />
        <StatCard label="Paid so far" value="₹0" icon="payments" />
        <StatCard label="Open invoices" value="0" icon="ledger" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            to: "/customer/invoices",
            icon: FileText,
            title: "My invoices",
            desc: "View all bills and dues.",
          },
          {
            to: "/customer/payments",
            icon: CreditCard,
            title: "Payments",
            desc: "History and pay online.",
          },
          {
            to: "/customer/ledger",
            icon: BookOpenCheck,
            title: "Ledger",
            desc: "Full account statement.",
          },
          {
            to: "/customer/ai",
            icon: Sparkles,
            title: "Ask AI",
            desc: "Plain-English Q&A on dues.",
          },
          {
            to: "/customer/settings",
            icon: Settings,
            title: "Profile",
            desc: "Update your details.",
          },
          {
            to: "/customer/dashboard",
            icon: LayoutDashboard,
            title: "Dashboard",
            desc: "Overview of your account.",
          },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Need help?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Contact the shop owner or use the AI assistant for questions.
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = "/customer/ai")}
          >
            Open AI Assistant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

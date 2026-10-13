import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, FileSpreadsheet, Download } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";

import { useShopStore } from "../../../stores/shop.store";
import { formatCurrency } from "../../../lib/utils";

import {
  useInventoryReport,
  usePaymentReport,
  useSalesReport,
} from "../../../hooks/useReportQueries";

const COLORS = ["#0f172a", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

export default function ReportsPage() {
  const shopId = useShopStore((s) => s.currentShopId);

  const { data: sales } = useSalesReport(shopId);
  const { data: payments } = usePaymentReport(shopId);
  const { data: inventory } = useInventoryReport(shopId);

  const periodSales =
    sales?.periodSales ??
    [
      { label: "Week 1", value: 42000 },
      { label: "Week 2", value: 51000 },
      { label: "Week 3", value: 38500 },
      { label: "Week 4", value: 62300 },
    ];

  const methodData = payments?.byMethod
    ? Object.entries(payments.byMethod).map(([name, value]) => ({
        name,
        value,
      }))
    : [
        { name: "Cash", value: 95000 },
        { name: "UPI", value: 62000 },
        { name: "Card", value: 31000 },
        { name: "Bank", value: 20000 },
      ];

  const topProducts =
    sales?.topProducts ??
    [
      { name: "Tata Salt 1kg", quantity: 520, revenue: 11440 },
      { name: "Aashirvaad Aata 5kg", quantity: 220, revenue: 39600 },
      { name: "Fortune Oil 1L", quantity: 310, revenue: 43400 },
      { name: "Amul Milk 1L", quantity: 900, revenue: 63000 },
      { name: "Surf Excel 1kg", quantity: 140, revenue: 9800 },
    ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports &amp; Insights
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Understand sales patterns, collections and stock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
          <Button
            leftIcon={<FileSpreadsheet className="h-4 w-4" />}
          >
            Download report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatCurrency(sales?.totalSales ?? 193800)}
          icon="sales"
          delta={{ type: "up", value: "+18% YoY" }}
        />
        <StatCard
          label="Avg invoice"
          value={formatCurrency(
            sales?.averageInvoiceValue ?? 1820,
          )}
          icon="invoices"
        />
        <StatCard
          label="Amount collected"
          value={formatCurrency(payments?.totalCollected ?? 208000)}
          icon="payments"
        />
        <StatCard
          label="Stock value"
          value={formatCurrency(
            inventory?.totalStockValue ?? 312400,
          )}
          icon="products"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              <CardTitle>Sales by period</CardTitle>
            </div>
            <CardDescription>
              Revenue across the selected periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={periodSales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#94a3b8"
                  />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {periodSales.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Collections by method</CardTitle>
            <CardDescription>
              Split across payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={92}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {methodData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top selling products</CardTitle>
          <CardDescription>
            Ranked by revenue generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-slate-900">
                      {p.name}
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.quantity} units sold
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(p.revenue)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

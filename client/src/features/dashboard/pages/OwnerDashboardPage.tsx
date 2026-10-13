import {
  Area,
  AreaChart,
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
import { IndianRupee, Package, Users, FileText, CreditCard, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { StatCard } from "../../../components/ui/StatCard";

import { useShopStore } from "../../../stores/shop.store";
import { formatCurrency, formatDate } from "../../../lib/utils";

import { useCustomers } from "../../../hooks/useCustomerQueries";
import { useProducts } from "../../../hooks/useProductQueries";
import { useInvoices } from "../../../hooks/useInvoiceQueries";
import {
  useInventoryReport,
  usePaymentReport,
  useSalesReport,
} from "../../../hooks/useReportQueries";

const salesData = [
  { label: "Mon", value: 8400 },
  { label: "Tue", value: 13200 },
  { label: "Wed", value: 10100 },
  { label: "Thu", value: 15800 },
  { label: "Fri", value: 19400 },
  { label: "Sat", value: 22100 },
  { label: "Sun", value: 16200 },
];

const paymentMix = [
  { name: "Cash", value: 45 },
  { name: "UPI", value: 30 },
  { name: "Card", value: 15 },
  { name: "Bank", value: 10 },
];

const COLORS = ["#0f172a", "#475569", "#64748b", "#94a3b8"];

export default function OwnerDashboardPage() {
  const shopId = useShopStore((s) => s.currentShopId);

  const { data: customers = [], isLoading: cl } =
    useCustomers(shopId);
  const { data: products = [], isLoading: pl } =
    useProducts(shopId);
  const { data: invoices = [], isLoading: il } =
    useInvoices(shopId);
  const { data: sales, isLoading: sl } = useSalesReport(shopId);
  const { data: payments, isLoading: pyl } =
    usePaymentReport(shopId);
  const { data: inventory, isLoading: inl } =
    useInventoryReport(shopId);

  const totals = {
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalInvoices: invoices.length,
    totalSales:
      sales?.totalSales ??
      invoices.reduce(
        (s, inv) => s + (inv.grandTotal ?? 0),
        0,
      ),
    totalCollected: payments?.totalCollected ?? 0,
    totalOutstanding: customers.reduce(
      (s, c) => s + (c.currentOutstanding ?? 0),
      0,
    ),
    inventoryValue: inventory?.totalStockValue ?? 0,
    unpaidInvoices: invoices.filter(
      (i) => i.paymentStatus !== "PAID",
    ).length,
  };

  const anyLoading = cl || pl || il || sl || pyl || inl;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A quick snapshot of your business today.
          </p>
        </div>
        <Badge variant="success">
          {anyLoading ? "Refreshing..." : "Live data"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatCurrency(totals.totalSales)}
          icon="sales"
          delta={{ type: "up", value: "+12.4% this week" }}
        />
        <StatCard
          label="Collected"
          value={formatCurrency(totals.totalCollected)}
          icon="payments"
          delta={{ type: "up", value: "UPI + Cash" }}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(totals.totalOutstanding)}
          icon="outstanding"
          delta={{
            type: "flat",
            value: `${totals.unpaidInvoices} invoices pending`,
          }}
        />
        <StatCard
          label="Stock value"
          value={formatCurrency(totals.inventoryValue)}
          icon="products"
          delta={{ type: "flat", value: `${totals.totalProducts} items` }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Customers
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  {totals.totalCustomers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Products</p>
                <p className="text-xl font-semibold text-slate-900">
                  {totals.totalProducts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Invoices</p>
                <p className="text-xl font-semibold text-slate-900">
                  {totals.totalInvoices}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Avg invoice
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(
                    totals.totalInvoices
                      ? totals.totalSales / totals.totalInvoices
                      : 0,
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales trend</CardTitle>
                <CardDescription>
                  Weekly sales overview
                </CardDescription>
              </div>
              <Badge variant="slate" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                This week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={sales?.periodSales ?? salesData}
                >
                  <defs>
                    <linearGradient
                      id="salesFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0f172a"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#0f172a"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                    fill="url(#salesFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment mix</CardTitle>
            <CardDescription>
              By collection method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={payments?.byMethod
                      ? Object.entries(payments.byMethod).map(
                          ([name, value]) => ({
                            name,
                            value,
                          }),
                        )
                      : paymentMix}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMix.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>
              Latest sales activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No invoices yet — create one from Sales &amp;
                Invoices.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                      Amount
                    </TableHead>
                    <TableHead className="text-right">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map((inv) => (
                    <TableRow key={inv._id}>
                      <TableCell>
                        <span className="font-medium text-slate-900">
                          {inv.invoiceNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        {inv.paymentStatus === "PAID" ? (
                          <Badge variant="success">
                            {inv.paymentStatus}
                          </Badge>
                        ) : inv.paymentStatus === "PARTIAL" ? (
                          <Badge variant="warning">
                            {inv.paymentStatus}
                          </Badge>
                        ) : (
                          <Badge variant="danger">
                            {inv.paymentStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {formatCurrency(inv.grandTotal)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top outstanding</CardTitle>
            <CardDescription>
              Customers with pending dues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.filter(
              (c) => (c.currentOutstanding ?? 0) > 0,
            ).length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                <CreditCard className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                No outstanding dues — great job!
              </div>
            ) : (
              <ul className="space-y-3">
                {[...customers]
                  .sort(
                    (a, b) =>
                      (b.currentOutstanding ?? 0) -
                      (a.currentOutstanding ?? 0),
                  )
                  .slice(0, 5)
                  .filter((c) => (c.currentOutstanding ?? 0) > 0)
                  .map((c) => (
                    <li
                      key={c._id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {c.phone}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        {formatCurrency(c.currentOutstanding ?? 0)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

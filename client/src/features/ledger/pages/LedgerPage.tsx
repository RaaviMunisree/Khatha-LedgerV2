import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  Search,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { EmptyState, StatCard } from "../../../components/ui/StatCard";
import { Select } from "../../../components/ui/Select";

import { useShopStore } from "../../../stores/shop.store";
import {
  formatCurrency,
  formatDate,
} from "../../../lib/utils";

import { useCustomers } from "../../../hooks/useCustomerQueries";
import { useInvoices } from "../../../hooks/useInvoiceQueries";
import type { LedgerEntry } from "../../ledger/types/ledger.types";

type FilterType = "ALL" | "CREDIT" | "DEBIT" | "ADJUSTMENT";

export default function LedgerPage() {
  const shopId = useShopStore((s) => s.currentShopId);
  const { data: customers = [] } = useCustomers(shopId);
  const { data: invoices = [] } = useInvoices(shopId);

  const [customerFilter, setCustomerFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [query, setQuery] = useState("");

  const entries: LedgerEntry[] = useMemo(() => {
    const list: LedgerEntry[] = [];
    invoices.forEach((inv) => {
      list.push({
        _id: inv._id,
        shopId: inv.shopId,
        customerId: String(inv.customerId),
        type: "CREDIT",
        amount: inv.grandTotal,
        balanceBefore: 0,
        balanceAfter: 0,
        description: `Invoice ${inv.invoiceNumber}`,
        referenceType: "INVOICE",
        referenceId: inv._id,
        createdBy: inv.createdBy,
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
      });
    });
    return list.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
  }, [invoices]);

  const filtered = useMemo(() => {
    let list = entries;
    if (customerFilter !== "ALL") {
      list = list.filter(
        (e) => e.customerId === customerFilter,
      );
    }
    if (typeFilter !== "ALL") {
      list = list.filter((e) => e.type === typeFilter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          (e.description ?? "")
            .toLowerCase()
            .includes(q) ||
          (e.referenceId ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [entries, customerFilter, typeFilter, query]);

  const totals = {
    credit: entries
      .filter((e) => e.type === "CREDIT")
      .reduce((s, e) => s + e.amount, 0),
    debit: entries
      .filter((e) => e.type === "DEBIT")
      .reduce((s, e) => s + e.amount, 0),
    adj: entries
      .filter((e) => e.type === "ADJUSTMENT")
      .reduce((s, e) => s + e.amount, 0),
  };
  const net = totals.credit - totals.debit + totals.adj;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Double-entry view of bills, collections and adjustments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Credit (billed)"
          value={formatCurrency(totals.credit)}
          icon="sales"
          delta={{ type: "up", value: "Invoices" }}
        />
        <StatCard
          label="Debit (paid)"
          value={formatCurrency(totals.debit)}
          icon="payments"
          delta={{ type: "down", value: "Collections" }}
        />
        <StatCard
          label="Adjustments"
          value={formatCurrency(totals.adj)}
          icon="ledger"
        />
        <StatCard
          label="Net balance"
          value={formatCurrency(net)}
          icon="outstanding"
          delta={{
            type: net >= 0 ? "down" : "up",
            value: net >= 0 ? "Due from customers" : "Overpaid",
          }}
        />
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div>
            <CardTitle>All ledger entries</CardTitle>
            <CardDescription>
              {filtered.length} of {entries.length} entries
            </CardDescription>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
              <Select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                options={[
                  { value: "ALL", label: "All customers" },
                  ...customers.map((c) => ({
                    value: c._id,
                    label: c.name,
                  })),
                ]}
                className="w-full sm:w-56"
              />
              <Select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as FilterType)
                }
                options={[
                  { value: "ALL", label: "All types" },
                  { value: "CREDIT", label: "Credit" },
                  { value: "DEBIT", label: "Debit" },
                  { value: "ADJUSTMENT", label: "Adjustment" },
                ]}
                className="w-full sm:w-44"
              />
            </div>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search description..."
                leftIcon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!entries.length ? (
            <EmptyState
              title="No ledger activity"
              description="Once you create invoices and record payments they'll appear here."
              icon={BookOpenCheck}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Direction</span>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Ref</TableHead>
                  <TableHead className="text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-right">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => {
                  const customer = customers.find(
                    (c) => c._id === e.customerId,
                  );
                  const isCredit = e.type === "CREDIT";
                  return (
                    <TableRow key={e._id}>
                      <TableCell className="text-slate-500">
                        {formatDate(e.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {customer?.name ?? "Unknown"}
                      </TableCell>
                      <TableCell>
                        {isCredit ? (
                          <Badge variant="danger" className="gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Cr
                          </Badge>
                        ) : e.type === "DEBIT" ? (
                          <Badge variant="success" className="gap-1">
                            <ArrowDownRight className="h-3 w-3" />
                            Dr
                          </Badge>
                        ) : (
                          <Badge variant="slate">Adj</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {e.description ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {e.referenceType}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          isCredit ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {formatCurrency(e.amount)}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {formatCurrency(e.balanceAfter)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

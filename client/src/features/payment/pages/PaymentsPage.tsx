import { useMemo, useState } from "react";
import { Plus, Search, CreditCard, Download } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
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
import { Dialog } from "../../../components/ui/Dialog";
import { EmptyState, StatCard } from "../../../components/ui/StatCard";
import { Select } from "../../../components/ui/Select";
import { Label } from "../../../components/ui/Label";
import { Textarea } from "../../../components/ui/Textarea";

import { useShopStore } from "../../../stores/shop.store";
import {
  formatCurrency,
  formatDate,
} from "../../../lib/utils";

import { useCustomers } from "../../../hooks/useCustomerQueries";
import { useInvoices } from "../../../hooks/useInvoiceQueries";
import { usePaymentReport } from "../../../hooks/useReportQueries";

import type {
  PaymentMethod,
} from "../../payment/types/payment.types";

export default function PaymentsPage() {
  const shopId = useShopStore((s) => s.currentShopId);
  const { data: customers = [] } = useCustomers(shopId);
  const { data: invoices = [] } = useInvoices(shopId);
  const { data: report } = usePaymentReport(shopId);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const combined = useMemo(() => {
    type Row = {
      id: string;
      kind: "INVOICE" | "PAYMENT";
      date: string;
      customerName: string;
      invoice: string;
      method?: PaymentMethod;
      amount: number;
      status: string;
    };
    const rows: Row[] = [];
    invoices.forEach((inv) => {
      const customer = customers.find(
        (c) => c._id === String(inv.customerId),
      );
      rows.push({
        id: inv._id,
        kind: "INVOICE",
        date: inv.createdAt,
        customerName: customer?.name ?? "Unknown",
        invoice: inv.invoiceNumber,
        amount: inv.grandTotal,
        status: inv.paymentStatus,
      });
    });
    return rows.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [invoices, customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return combined;
    return combined.filter(
      (r) =>
        r.customerName.toLowerCase().includes(q) ||
        r.invoice.toLowerCase().includes(q),
    );
  }, [combined, query]);

  const totalCollected = combined
    .filter((r) => r.status === "PAID")
    .reduce((s, r) => s + r.amount, 0);
  const pending = combined
    .filter((r) => r.status !== "PAID")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Payments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Collections, methods, and customer dues.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Record payment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Collected"
          value={formatCurrency(
            report?.totalCollected ?? totalCollected,
          )}
          icon="payments"
          delta={{ type: "up", value: "All time" }}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(pending)}
          icon="outstanding"
          delta={{ type: "flat", value: "Due" }}
        />
        <StatCard
          label="Records"
          value={combined.length.toString()}
          icon="ledger"
        />
        <StatCard
          label="Open dues"
          value={combined
            .filter((r) => r.status === "UNPAID")
            .length.toString()}
          icon="invoices"
        />
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Payment activity</CardTitle>
            <CardDescription>
              {filtered.length} transactions
            </CardDescription>
          </div>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search customer or invoice..."
              leftIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {!combined.length ? (
            <EmptyState
              title="No activity yet"
              description="Raise invoices and record payments to see them here."
              icon={CreditCard}
              action={
                <Button onClick={() => setOpen(true)}>
                  Record a payment
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">
                    Amount
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-slate-500">
                      {formatDate(r.date)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {r.customerName}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {r.invoice}
                    </TableCell>
                    <TableCell>
                      {r.method ? (
                        <Badge variant="slate">
                          {r.method.replace("_", " ")}
                        </Badge>
                      ) : (
                        <Badge variant="info">Invoice</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">
                      {formatCurrency(r.amount)}
                    </TableCell>
                    <TableCell>
                      {r.status === "PAID" ? (
                        <Badge variant="success">Paid</Badge>
                      ) : r.status === "PARTIAL" ? (
                        <Badge variant="warning">Partial</Badge>
                      ) : (
                        <Badge variant="danger">Unpaid</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Record payment
            </h2>
            <p className="text-sm text-slate-500">
              Choose a customer, optionally attach an invoice.
            </p>
          </div>
          <Select
            label="Customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            options={[
              {
                value: "",
                label: "Select a customer",
                disabled: true,
              },
              ...customers.map((c) => ({
                value: c._id,
                label: `${c.name} · Due ${formatCurrency(c.currentOutstanding ?? 0)}`,
              })),
            ]}
          />
          <Select
            label="Invoice (optional)"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            options={[
              {
                value: "",
                label: "No invoice (general payment)",
              },
              ...invoices.map((i) => ({
                value: i._id,
                label: `${i.invoiceNumber} · ${formatCurrency(i.grandTotal)}`,
              })),
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                className="mt-1.5"
                value={amount}
                onChange={(e) =>
                  setAmount(Number(e.target.value) || 0)
                }
              />
            </div>
            <Select
              label="Method"
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as PaymentMethod)
              }
              options={[
                { value: "CASH", label: "Cash" },
                { value: "UPI", label: "UPI" },
                { value: "CARD", label: "Card" },
                { value: "BANK_TRANSFER", label: "Bank transfer" },
                { value: "ONLINE_GATEWAY", label: "Online gateway" },
              ]}
            />
          </div>
          <Input
            label="Transaction reference (optional)"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="UPI ID, cheque no, gateway id..."
          />
          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setOpen(false)}
              disabled={!customerId || amount <= 0}
            >
              Save payment
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

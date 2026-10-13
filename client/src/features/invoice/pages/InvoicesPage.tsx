import { useMemo, useState } from "react";
import { Plus, Search, ArrowDownUp } from "lucide-react";

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

import { useShopStore } from "../../../stores/shop.store";
import { formatCurrency, formatDate } from "../../../lib/utils";

import { useCustomers } from "../../../hooks/useCustomerQueries";
import { useProducts } from "../../../hooks/useProductQueries";
import {
  useCancelInvoice,
  useCreateInvoice,
  useInvoices,
} from "../../../hooks/useInvoiceQueries";
import {
  useCustomerPaymentHistory,
  useCreatePayment,
} from "../../../hooks/usePaymentQueries";

import type { InvoiceItem } from "../../invoice/types/invoice.types";
import type { Product } from "../../product/types/product.types";
import { Select } from "../../../components/ui/Select";
import { Label } from "../../../components/ui/Label";

interface BasketLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export default function InvoicesPage() {
  const shopId = useShopStore((s) => s.currentShopId);
  const { data: invoices = [], isLoading } = useInvoices(shopId);
  const { data: customers = [] } = useCustomers(shopId);
  const { data: products = [] } = useProducts(shopId);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [basket, setBasket] = useState<BasketLine[]>([]);

  const createMutation = useCreateInvoice();
  const cancelMutation = useCancelInvoice();
  useCustomerPaymentHistory;
  useCreatePayment;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.customerId as string)
          .toLowerCase()
          .includes(q),
    );
  }, [invoices, query]);

  const totals = useMemo(() => {
    const total = invoices.reduce(
      (s, i) => s + (i.grandTotal ?? 0),
      0,
    );
    const unpaid = invoices
      .filter((i) => i.paymentStatus === "UNPAID")
      .reduce((s, i) => s + (i.grandTotal ?? 0), 0);
    const paid = invoices
      .filter((i) => i.paymentStatus === "PAID")
      .reduce((s, i) => s + (i.grandTotal ?? 0), 0);
    return { count: invoices.length, total, unpaid, paid };
  }, [invoices]);

  const subTotal = basket.reduce(
    (sum, line) =>
      sum + line.quantity * line.unitPrice,
    0,
  );
  const taxAmount = basket.reduce(
    (sum, line) =>
      sum +
      line.quantity *
        line.unitPrice *
        ((line.taxRate ?? 0) / 100),
    0,
  );
  const grandTotal = Math.max(0, subTotal + taxAmount - (discount ?? 0));

  const addProductToBasket = (p: Product) => {
    const existing = basket.find(
      (b) => b.productId === p._id,
    );
    if (existing) {
      setBasket((prev) =>
        prev.map((b) =>
          b.productId === p._id
            ? { ...b, quantity: b.quantity + 1 }
            : b,
        ),
      );
    } else {
      setBasket((prev) => [
        ...prev,
        {
          productId: p._id,
          productName: p.name,
          quantity: 1,
          unitPrice: p.sellingPrice,
          taxRate: p.taxRate ?? 0,
        },
      ]);
    }
  };

  const updateQty = (productId: string, qty: number) => {
    setBasket((prev) =>
      prev
        .map((b) =>
          b.productId === productId
            ? { ...b, quantity: Math.max(1, qty) }
            : b,
        )
        .filter((b) => b.quantity > 0),
    );
  };

  const removeLine = (productId: string) => {
    setBasket((prev) =>
      prev.filter((b) => b.productId !== productId),
    );
  };

  const submitInvoice = async () => {
    if (!shopId || !customerId) return;
    if (!basket.length) return;

    const items: InvoiceItem[] = basket.map((b) => {
      const lineTax =
        b.quantity *
        b.unitPrice *
        ((b.taxRate ?? 0) / 100);
      return {
        productId: b.productId,
        productName: b.productName,
        quantity: b.quantity,
        unitPrice: b.unitPrice,
        taxRate: b.taxRate ?? 0,
        taxAmount: Number(lineTax.toFixed(2)),
        total: Number(
          (b.quantity * b.unitPrice + lineTax).toFixed(2),
        ),
      };
    });

    await createMutation.mutateAsync({
      shopId,
      input: {
        customerId,
        items,
        discount: discount ?? 0,
      },
    });

    setOpen(false);
    setBasket([]);
    setCustomerId("");
    setDiscount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sales &amp; Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create bills, track dues and accept payments.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setOpen(true)}
        >
          New invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Invoices"
          value={totals.count.toString()}
          icon="invoices"
        />
        <StatCard
          label="Total billed"
          value={formatCurrency(totals.total)}
          icon="sales"
        />
        <StatCard
          label="Paid"
          value={formatCurrency(totals.paid)}
          icon="payments"
          delta={{ type: "up", value: "Received" }}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(totals.unpaid)}
          icon="outstanding"
          delta={{ type: "down", value: "To collect" }}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Invoice list</CardTitle>
            <CardDescription>
              {filtered.length} of {invoices.length} shown
            </CardDescription>
          </div>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search invoice number..."
              leftIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading invoices...
            </div>
          ) : !filtered.length ? (
            <EmptyState
              title="No invoices yet"
              description="Create your first invoice to record a sale."
              action={
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setOpen(true)}
                >
                  Create invoice
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Grand total
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <ArrowDownUp className="h-3 w-3" />
                      Date
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv._id}>
                    <TableCell className="font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {String(inv.customerId).slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {inv.status === "CONFIRMED" ? (
                          <Badge variant="success">
                            {inv.status}
                          </Badge>
                        ) : inv.status === "CANCELLED" ? (
                          <Badge variant="danger">
                            {inv.status}
                          </Badge>
                        ) : (
                          <Badge variant="slate">
                            {inv.status}
                          </Badge>
                        )}
                        {inv.paymentStatus === "PAID" ? (
                          <Badge variant="success">
                            Paid
                          </Badge>
                        ) : inv.paymentStatus === "PARTIAL" ? (
                          <Badge variant="warning">
                            Partial
                          </Badge>
                        ) : (
                          <Badge variant="danger">
                            Unpaid
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {formatCurrency(inv.grandTotal)}
                    </TableCell>
                    <TableCell className="text-right text-slate-500">
                      {formatDate(inv.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            cancelMutation.mutate({
                              shopId: shopId!,
                              invoiceId: inv._id,
                            })
                          }
                        >
                          Cancel
                        </Button>
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto relative">
          <h2 className="text-lg font-semibold text-slate-900">
            New invoice
          </h2>
          <p className="text-sm text-slate-500">
            Add items and raise a bill for the customer.
          </p>

          <div className="mt-5 space-y-5">
            <div>
              <Label>Customer</Label>
              <Select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1.5"
                options={[
                  {
                    value: "",
                    label: "Select a customer",
                    disabled: true,
                  },
                  ...customers.map((c) => ({
                    value: c._id,
                    label: `${c.name} · ${c.phone}`,
                  })),
                ]}
              />
            </div>

            <div>
              <Label>Quick add product</Label>
              <div className="mt-1.5 grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-2 md:grid-cols-2">
                {products.map((p) => (
                  <button
                    type="button"
                    key={p._id}
                    onClick={() => addProductToBasket(p)}
                    className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.sku} · Stock {p.currentStock}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(p.sellingPrice)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {basket.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-12 gap-2 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-1" />
                </div>
                {basket.map((b) => {
                  const amount = b.quantity * b.unitPrice;
                  return (
                    <div
                      key={b.productId}
                      className="grid grid-cols-12 items-center gap-2 border-t border-slate-100 px-3 py-2 text-sm"
                    >
                      <div className="col-span-5 truncate">
                        {b.productName}
                      </div>
                      <div className="col-span-2 text-right text-slate-700">
                        {formatCurrency(b.unitPrice)}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input
                          type="number"
                          min={1}
                          value={b.quantity}
                          onChange={(e) =>
                            updateQty(
                              b.productId,
                              Number(e.target.value),
                            )
                          }
                          className="w-16 rounded-md border border-slate-300 px-2 py-1 text-center text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                      <div className="col-span-2 text-right font-medium text-slate-900">
                        {formatCurrency(amount)}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeLine(b.productId)}
                          className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Discount</span>
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Number(e.target.value) || 0)
                  }
                  className="ml-2 w-28 rounded-md border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                <span>Grand total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitInvoice}
                loading={createMutation.isPending}
                disabled={!customerId || basket.length === 0}
              >
                Raise invoice
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

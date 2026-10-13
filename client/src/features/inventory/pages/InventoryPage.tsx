import { useMemo, useState } from "react";
import { Plus, Search, AlertTriangle, Package2 } from "lucide-react";

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
import { formatCurrency, formatRelativeDate } from "../../../lib/utils";

import { useProducts } from "../../../hooks/useProductQueries";
import { useInventoryReport } from "../../../hooks/useReportQueries";

import type { InventoryType } from "../../inventory/types/inventory.types";

export default function InventoryPage() {
  const shopId = useShopStore((s) => s.currentShopId);
  const { data: products = [], isLoading } = useProducts(shopId);
  const { data: report } = useInventoryReport(shopId);

  const [query, setQuery] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<InventoryType>("PURCHASE");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    let list = products;
    if (onlyLow) {
      list = list.filter(
        (p) => p.currentStock <= (p.minimumStock ?? 0),
      );
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [products, onlyLow, query]);

  const stockValue = products.reduce(
    (s, p) => s + (p.currentStock ?? 0) * (p.purchasePrice ?? 0),
    0,
  );
  const lowStock = products.filter(
    (p) => p.currentStock <= (p.minimumStock ?? 0),
  ).length;
  const outOfStock = products.filter(
    (p) => p.currentStock <= 0,
  ).length;

  const handleSubmitTx = () => {
    setOpen(false);
    setProductId("");
    setQty(1);
    setNote("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stock movements, valuations and low-stock alerts.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setOpen(true)}
        >
          Record stock change
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="SKUs tracked"
          value={(report?.totalProducts ?? products.length).toString()}
          icon="products"
        />
        <StatCard
          label="Stock value"
          value={formatCurrency(
            report?.totalStockValue ?? stockValue,
          )}
          icon="revenue"
          delta={{ type: "flat", value: "At purchase price" }}
        />
        <StatCard
          label="Low stock"
          value={(report?.lowStockItems ?? lowStock).toString()}
          icon="products"
          delta={{ type: "down", value: "Needs attention" }}
        />
        <StatCard
          label="Out of stock"
          value={outOfStock.toString()}
          icon="products"
          delta={{ type: "down", value: "Order now" }}
        />
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Current stock</CardTitle>
            <CardDescription>
              {filtered.length} of {products.length} shown
            </CardDescription>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                checked={onlyLow}
                onChange={(e) => setOnlyLow(e.target.checked)}
              />
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Low stock only
              </span>
            </label>
            <div className="w-full max-w-xs sm:w-64">
              <Input
                placeholder="Search product..."
                leftIcon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading inventory...
            </div>
          ) : !filtered.length ? (
            <EmptyState
              title="Nothing here"
              description={
                onlyLow
                  ? "All products have healthy stock levels."
                  : "Add products to begin tracking inventory."
              }
              icon={Package2}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">
                    Current
                  </TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">
                    Value
                  </TableHead>
                  <TableHead>Last update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const low =
                    p.currentStock <= (p.minimumStock ?? 0);
                  return (
                    <TableRow key={p._id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {p.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {p.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="slate">{p.unit}</Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          low ? "text-amber-600" : "text-slate-900"
                        }`}
                      >
                        {p.currentStock}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        {p.minimumStock}
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {formatCurrency(
                          p.currentStock * p.purchasePrice,
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatRelativeDate(p.updatedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Record stock change
            </h2>
            <p className="text-sm text-slate-500">
              Purchase, return, damage or manual adjustment.
            </p>
          </div>
          <Select
            label="Product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            options={[
              {
                value: "",
                label: "Select product",
                disabled: true,
              },
              ...products.map((p) => ({
                value: p._id,
                label: `${p.name} (${p.currentStock} ${p.unit})`,
              })),
            ]}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              value={type}
              onChange={(e) =>
                setType(e.target.value as InventoryType)
              }
              options={[
                { value: "PURCHASE", label: "Purchase (in)" },
                { value: "SALE", label: "Sale (out)" },
                { value: "RETURN", label: "Return (in)" },
                { value: "DAMAGE", label: "Damage (out)" },
                { value: "EXPIRY", label: "Expiry (out)" },
                { value: "ADJUSTMENT", label: "Adjustment" },
              ]}
            />
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                className="mt-1.5"
                value={qty}
                onChange={(e) =>
                  setQty(Number(e.target.value) || 1)
                }
              />
            </div>
          </div>
          <Textarea
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Purchase order #123, damage in transit..."
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitTx}>
              Save transaction
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

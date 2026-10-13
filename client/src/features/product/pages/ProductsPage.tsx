import { useMemo, useState } from "react";
import { Plus, Pencil, Search, AlertTriangle } from "lucide-react";

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
import { formatCurrency } from "../../../lib/utils";

import {
  useCreateProduct,
  useDeactivateProduct,
  useProducts,
  useUpdateProduct,
} from "../../../hooks/useProductQueries";

import ProductFormDialog from "../components/ProductFormDialog";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../types/product.types";

type Mode = "create" | "edit" | null;

export default function ProductsPage() {
  const shopId = useShopStore((s) => s.currentShopId);
  const { data: products = [], isLoading } = useProducts(shopId);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deactivateMutation = useDeactivateProduct();
  const submitting =
    createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q),
    );
  }, [products, query]);

  const stats = useMemo(() => {
    const total = products.length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + (p.currentStock ?? 0) * (p.purchasePrice ?? 0),
      0,
    );
    const lowStock = products.filter(
      (p) => p.currentStock <= (p.minimumStock ?? 0),
    ).length;
    const expectedProfit = products.reduce(
      (sum, p) =>
        sum +
        (p.currentStock ?? 0) *
          ((p.sellingPrice ?? 0) - (p.purchasePrice ?? 0)),
      0,
    );
    return { total, totalStockValue, lowStock, expectedProfit };
  }, [products]);

  const handleSubmit = async (
    data: CreateProductInput | UpdateProductInput,
  ) => {
    if (!shopId) return;
    if (mode === "create") {
      await createMutation.mutateAsync({
        shopId,
        input: data as CreateProductInput,
      });
    } else if (mode === "edit" && selected) {
      await updateMutation.mutateAsync({
        shopId,
        productId: selected._id,
        input: data as UpdateProductInput,
      });
    }
    setOpen(false);
    setMode(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your catalog, pricing and units.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setMode("create");
            setSelected(null);
            setOpen(true);
          }}
        >
          New product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Products"
          value={stats.total.toString()}
          icon="products"
        />
        <StatCard
          label="Inventory value (cost)"
          value={formatCurrency(stats.totalStockValue)}
          icon="revenue"
        />
        <StatCard
          label="Expected profit on stock"
          value={formatCurrency(stats.expectedProfit)}
          icon="sales"
          delta={{ type: "up", value: "On sale" }}
        />
        <StatCard
          label="Low stock items"
          value={stats.lowStock.toString()}
          icon="products"
          delta={{ type: "down", value: "Check alerts" }}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Product catalog</CardTitle>
            <CardDescription>
              {filtered.length} of {products.length} shown
            </CardDescription>
          </div>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search by name or SKU..."
              leftIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : !filtered.length ? (
            <EmptyState
              title="No products yet"
              description="Create products so you can raise invoices and track stock."
              action={
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setMode("create");
                    setOpen(true);
                  }}
                >
                  Add product
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">
                    Purchase
                  </TableHead>
                  <TableHead className="text-right">Selling</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
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
                            SKU: {p.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="slate">{p.unit}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            low ? "font-semibold text-amber-600" : ""
                          }
                        >
                          {p.currentStock}
                          {low && (
                            <span className="ml-1 inline-flex items-center text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Low
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-slate-700">
                        {formatCurrency(p.purchasePrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-900">
                        {formatCurrency(p.sellingPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === "ACTIVE" ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="slate">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Pencil className="h-3.5 w-3.5" />}
                            onClick={() => {
                              setSelected(p);
                              setMode("edit");
                              setOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          {p.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                deactivateMutation.mutate({
                                  shopId: shopId!,
                                  productId: p._id,
                                })
                              }
                            >
                              Disable
                            </Button>
                          )}
                        </div>
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
        <ProductFormDialog
          mode={mode ?? "create"}
          initial={selected}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </div>
  );
}

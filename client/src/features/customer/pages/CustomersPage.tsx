import { useMemo, useState } from "react";
import { Plus, Search, Pencil, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  useCreateCustomer,
  useCustomers,
  useDeactivateCustomer,
  useUpdateCustomer,
} from "../../../hooks/useCustomerQueries";

import CustomerFormDialog from "../components/CustomerFormDialog";
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "../types/customer.types";

type Mode = "create" | "edit" | null;

export default function CustomersPage() {
  const navigate = useNavigate();
  const shopId = useShopStore((s) => s.currentShopId);
  const { data: customers = [], isLoading } = useCustomers(shopId);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<Customer | null>(null);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deactivateMutation = useDeactivateCustomer();

  const submitting =
    createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    );
  }, [customers, query]);

  const stats = useMemo(() => {
    const total = customers.length;
    const totalOutstanding = customers.reduce(
      (sum, c) => sum + (c.currentOutstanding ?? 0),
      0,
    );
    const totalCreditLimit = customers.reduce(
      (sum, c) => sum + (c.creditLimit ?? 0),
      0,
    );
    const active = customers.filter(
      (c) => c.status === "ACTIVE",
    ).length;
    return { total, totalOutstanding, totalCreditLimit, active };
  }, [customers]);

  const handleSubmit = async (
    data: CreateCustomerInput | UpdateCustomerInput,
  ) => {
    if (!shopId) return;
    if (mode === "create") {
      await createMutation.mutateAsync({
        shopId,
        input: data as CreateCustomerInput,
      });
    } else if (mode === "edit" && selected) {
      await updateMutation.mutateAsync({
        shopId,
        customerId: selected._id,
        input: data as UpdateCustomerInput,
      });
    }
    setOpen(false);
    setMode(null);
    setSelected(null);
  };

  const handleDeactivate = async (customer: Customer) => {
    if (!shopId) return;
    await deactivateMutation.mutateAsync({
      shopId,
      customerId: customer._id,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track credit, outstanding and customer profiles.
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
          New customer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total customers"
          value={stats.total.toString()}
          icon="customers"
          delta={{ type: "flat", value: `${stats.active} active` }}
        />
        <StatCard
          label="Total outstanding"
          value={formatCurrency(stats.totalOutstanding)}
          icon="outstanding"
        />
        <StatCard
          label="Credit limit issued"
          value={formatCurrency(stats.totalCreditLimit)}
          icon="revenue"
        />
        <StatCard
          label="Active customers"
          value={stats.active.toString()}
          icon="customers"
          delta={{
            type: "flat",
            value: `${Math.round(
              stats.total ? (stats.active / stats.total) * 100 : 0,
            )}% of total`,
          }}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>All customers</CardTitle>
            <CardDescription>
              {filtered.length} of {customers.length} shown
            </CardDescription>
          </div>
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search by name, phone or email..."
              leftIcon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-500">
              Loading customers...
            </div>
          ) : !filtered.length ? (
            <EmptyState
              title="No customers yet"
              description="Add your first customer to begin tracking credits and invoices."
              action={
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setMode("create");
                    setOpen(true);
                  }}
                >
                  Add customer
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    Credit limit
                  </TableHead>
                  <TableHead className="text-right">
                    Outstanding
                  </TableHead>
                  <TableHead className="text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {c.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {c.email ?? "No email"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {c.phone}
                    </TableCell>
                    <TableCell>
                      {c.status === "ACTIVE" ? (
                        <Badge variant="success">Active</Badge>
                      ) : c.status === "BLOCKED" ? (
                        <Badge variant="danger">Blocked</Badge>
                      ) : (
                        <Badge variant="slate">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-slate-700">
                      {formatCurrency(c.creditLimit ?? 0)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        (c.currentOutstanding ?? 0) > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {formatCurrency(c.currentOutstanding ?? 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => {
                            setSelected(c);
                            setMode("edit");
                            setOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                          }
                          onClick={() =>
                            navigate(
                              `/owner/ledger?customerId=${c._id}`,
                            )
                          }
                        >
                          Ledger
                        </Button>
                        {c.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeactivate(c)}
                          >
                            Disable
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <CustomerFormDialog
          mode={mode ?? "create"}
          initial={selected}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Badge } from "../../../components/ui/Badge";

import { useShopStore } from "../../../stores/shop.store";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import {
  useCreateShop,
  useMyShops,
  useUpdateShop,
} from "../../../hooks/useShopQueries";

import type {
  BusinessType,
  CreateShopInput,
} from "../../../features/shop/types/shop.types";

const shopSchema = z.object({
  name: z.string().trim().min(2, "Shop name is required"),
  businessType: z.enum([
    "GROCERY",
    "RETAIL",
    "PHARMACY",
    "ELECTRONICS",
    "OTHER",
  ]),
  phone: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
});

type Form = z.infer<typeof shopSchema>;

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "GROCERY", label: "Grocery Store" },
  { value: "RETAIL", label: "Retail Shop" },
  { value: "PHARMACY", label: "Pharmacy" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "OTHER", label: "Other" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: shops = [] } = useMyShops();
  const currentShop = useShopStore((s) => s.currentShop);
  const setCurrentShop = useShopStore((s) => s.setCurrentShop);

  const create = useCreateShop();
  const update = useUpdateShop();

  const [mode, setMode] = useState<"edit" | "create">(
    currentShop ? "edit" : "create",
  );

  useEffect(() => {
    setMode(currentShop ? "edit" : "create");
  }, [currentShop]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(shopSchema),
    defaultValues: currentShop
      ? {
          name: currentShop.name,
          businessType: currentShop.businessType,
          phone: currentShop.phone ?? "",
          address: currentShop.address ?? "",
        }
      : {
          businessType: "GROCERY",
        },
  });

  useEffect(() => {
    if (currentShop) {
      reset({
        name: currentShop.name,
        businessType: currentShop.businessType,
        phone: currentShop.phone ?? "",
        address: currentShop.address ?? "",
      });
    }
  }, [currentShop, reset]);

  const onSubmit = async (data: Form) => {
    const payload: CreateShopInput = {
      name: data.name,
      businessType: data.businessType,
      phone: data.phone || undefined,
      address: data.address || undefined,
    };
    if (mode === "create") {
      const res = await create.mutateAsync(payload);
      if (res.data?._id) {
        setCurrentShop(res.data);
      }
    } else if (currentShop) {
      await update.mutateAsync({
        id: currentShop._id,
        input: payload,
      });
    }
  };

  const isSubmitting = create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your shop details and workspace preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Shop details
                </CardTitle>
                <CardDescription>
                  {mode === "edit"
                    ? "Update your shop information."
                    : "Create your first shop to get started."}
                </CardDescription>
              </div>
              <Badge variant="slate">
                {mode === "edit" ? "Editing" : "New shop"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {shops.length > 0 && (
              <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {shops.map((s) => (
                  <button
                    type="button"
                    key={s._id}
                    onClick={() => setCurrentShop(s)}
                    className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition ${
                      currentShop?._id === s._id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium text-slate-900">
                      {s.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {s.businessType} · {s.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <form
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                label="Shop name"
                placeholder="Sharma General Store"
                {...register("name")}
                error={errors.name?.message}
              />
              <Select
                label="Business type"
                options={businessTypes}
                {...register("businessType")}
                error={errors.businessType?.message}
              />
              <Input
                label="Phone"
                placeholder="+91 98XXXXXX"
                {...register("phone")}
                error={errors.phone?.message}
              />
              <Input
                label="Address"
                placeholder="Street, City, State"
                className="sm:col-span-2"
                {...register("address")}
                error={errors.address?.message}
              />

              <div className="flex items-center justify-between gap-2 sm:col-span-2">
                <div className="text-sm text-slate-500">
                  Saved automatically. Use the tiles above to switch between shops.
                </div>
                <Button
                  type="submit"
                  leftIcon={<Save className="h-4 w-4" />}
                  loading={isSubmitting}
                >
                  {mode === "edit"
                    ? "Save changes"
                    : "Create shop"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Signed in as {user?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-900">
                  {user?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-900">
                  {user?.email ?? "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Role</span>
                <Badge variant="slate">
                  {user?.role?.replace("_", " ")}
                </Badge>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={logout}
              >
                Sign out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About KhataX</CardTitle>
              <CardDescription>
                Credit, billing &amp; business platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Built for small businesses — grocery stores, retail,
              pharmacies and more — to replace paper khata with a
              single connected system.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

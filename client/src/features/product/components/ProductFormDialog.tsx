import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../../../components/ui/Dialog";

import type {
  CreateProductInput,
  Product,
  ProductUnit,
  UpdateProductInput,
} from "../types/product.types";

const units: { value: ProductUnit; label: string }[] = [
  { value: "PCS", label: "Pieces (PCS)" },
  { value: "KG", label: "Kilograms (KG)" },
  { value: "GRAM", label: "Grams (GRAM)" },
  { value: "LITRE", label: "Litres (LITRE)" },
  { value: "ML", label: "Millilitres (ML)" },
  { value: "BOX", label: "Boxes (BOX)" },
  { value: "PACK", label: "Packs (PACK)" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  sku: z.string().trim().min(2, "SKU is required"),
  unit: z.enum([
    "PCS",
    "KG",
    "GRAM",
    "LITRE",
    "ML",
    "BOX",
    "PACK",
  ]),
  purchasePrice: z.coerce.number().min(0, "Must be >= 0"),
  sellingPrice: z.coerce.number().min(0, "Must be >= 0"),
  taxRate: z.coerce.number().min(0).max(100),
  currentStock: z.coerce.number().min(0),
  minimumStock: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Product | null;
  onSubmit: (
    data: CreateProductInput | UpdateProductInput,
  ) => Promise<void>;
  submitting?: boolean;
  mode?: "create" | "edit";
}

export default function ProductFormDialog({
  initial,
  onSubmit,
  submitting,
  mode = "create",
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: initial
      ? {
          name: initial.name,
          sku: initial.sku,
          unit: initial.unit,
          purchasePrice: initial.purchasePrice ?? 0,
          sellingPrice: initial.sellingPrice ?? 0,
          taxRate: initial.taxRate ?? 0,
          currentStock: initial.currentStock ?? 0,
          minimumStock: initial.minimumStock ?? 0,
        }
      : {
          name: "",
          sku: "",
          unit: "PCS",
          purchasePrice: 0,
          sellingPrice: 0,
          taxRate: 0,
          currentStock: 0,
          minimumStock: 0,
        },
  });

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    await onSubmit({
      name: data.name,
      sku: data.sku,
      unit: data.unit,
      purchasePrice: data.purchasePrice,
      sellingPrice: data.sellingPrice,
      taxRate: data.taxRate,
      currentStock: data.currentStock,
      minimumStock: data.minimumStock,
    });
  };

  return (
    <DialogContent>
      <DialogHeader
        title={mode === "edit" ? "Edit product" : "Add new product"}
        description={
          mode === "edit"
            ? "Keep product details up to date."
            : "Products are used in invoices and stock tracking."
        }
      />
      <form
        className="space-y-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Name"
            placeholder="Tata Salt 1kg"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="SKU"
            placeholder="TATA-SALT-1K"
            {...register("sku")}
            error={errors.sku?.message}
          />
          <Select
            label="Unit"
            options={units}
            {...register("unit")}
            error={errors.unit?.message}
          />
          <Input
            label="Purchase price (₹)"
            type="number"
            min={0}
            placeholder="18"
            {...register("purchasePrice")}
            error={errors.purchasePrice?.message}
          />
          <Input
            label="Selling price (₹)"
            type="number"
            min={0}
            placeholder="22"
            {...register("sellingPrice")}
            error={errors.sellingPrice?.message}
          />
          <Input
            label="Tax rate (%)"
            type="number"
            min={0}
            max={100}
            placeholder="0"
            {...register("taxRate")}
            error={errors.taxRate?.message}
          />
          <Input
            label="Current stock"
            type="number"
            min={0}
            placeholder="100"
            {...register("currentStock")}
            error={errors.currentStock?.message}
          />
          <Input
            label="Minimum stock"
            type="number"
            min={0}
            placeholder="10"
            {...register("minimumStock")}
            error={errors.minimumStock?.message}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            loading={submitting}
          >
            {mode === "edit"
              ? "Save changes"
              : "Create product"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

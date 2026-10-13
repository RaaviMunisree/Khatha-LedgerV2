import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../../../components/ui/Dialog";

import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "../types/customer.types";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Phone is required"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .or(z.literal(""))
    .optional(),
  address: z.string().trim().optional().or(z.literal("")),
  creditLimit: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initial?: Customer | null;
  onSubmit: (
    data: CreateCustomerInput | UpdateCustomerInput,
  ) => Promise<void>;
  submitting?: boolean;
  mode?: "create" | "edit";
}

export default function CustomerFormDialog({
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
          phone: initial.phone,
          email: initial.email ?? "",
          address: initial.address ?? "",
          creditLimit: initial.creditLimit ?? 0,
        }
      : {
          name: "",
          phone: "",
          email: "",
          address: "",
          creditLimit: 0,
        },
  });

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    await onSubmit({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
      creditLimit: data.creditLimit,
    });
  };

  return (
    <DialogContent>
      <DialogHeader
        title={mode === "edit" ? "Edit customer" : "Add new customer"}
        description={
          mode === "edit"
            ? "Update the customer information below."
            : "Customers help you track credit and outstanding."
        }
      />

      <form
        className="space-y-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Full name"
            placeholder="Rahul Sharma"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Phone"
            placeholder="+91 98XXXXXX"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="customer@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Credit limit"
            type="number"
            min={0}
            placeholder="0"
            {...register("creditLimit")}
            error={errors.creditLimit?.message}
          />
        </div>
        <Input
          label="Address (optional)"
          placeholder="Street, City..."
          {...register("address")}
          error={errors.address?.message}
        />

        <DialogFooter>
          <Button
            type="submit"
            loading={submitting}
          >
            {mode === "edit"
              ? "Save changes"
              : "Create customer"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

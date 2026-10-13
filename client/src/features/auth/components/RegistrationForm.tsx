import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/auth.schema";

interface RegisterFormProps {
  onSubmit: (
    data: RegisterFormData,
  ) => Promise<void>;
  isSubmitting?: boolean;
  serverError?: string;
}

const RegisterForm = ({
  onSubmit,
  isSubmitting = false,
  serverError,
}: RegisterFormProps) => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "SHOP_OWNER",
    },
  });

  const role = watch("role");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <Input
        id="name"
        label="Name"
        placeholder="Your name"
        {...register("name")}
        error={errors.name?.message}
      />

      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <Input
        id="phone"
        type="tel"
        label="Phone"
        placeholder="Phone number"
        {...register("phone")}
        error={errors.phone?.message}
      />

      <Input
        id="password"
        type="password"
        label="Password"
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        {...register("password")}
        error={errors.password?.message}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="role"
          className="block text-sm font-medium text-slate-700"
        >
          Account type
        </label>

        <select
          id="role"
          {...register("role")}
          className="
            w-full
            rounded-lg
            border
            border-slate-300
            bg-white
            px-3
            py-2.5
            text-sm
            outline-none
            focus:border-slate-500
            focus:ring-2
            focus:ring-slate-200
          "
        >
          <option value="SHOP_OWNER">
            Shop Owner
          </option>

          <option value="CUSTOMER">
            Customer
          </option>
        </select>

        {errors.role && (
          <p className="text-xs text-red-600">
            {errors.role.message}
          </p>
        )}
      </div>

      {role === "CUSTOMER" && (
        <Input
          id="customerId"
          label="Customer ID"
          placeholder="Enter your customer ID"
          {...register("customerId")}
          error={errors.customerId?.message}
        />
      )}

      {serverError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;
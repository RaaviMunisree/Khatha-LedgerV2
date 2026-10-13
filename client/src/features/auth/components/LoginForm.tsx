import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

import {
  loginSchema,
  type LoginFormData,
} from "../schemas/auth.schema";

interface LoginFormProps {
  onSubmit: (
    data: LoginFormData,
  ) => Promise<void>;
  isSubmitting?: boolean;
  serverError?: string;
}

const LoginForm = ({
  onSubmit,
  isSubmitting = false,
  serverError,
}: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
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
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        {...register("password")}
        error={errors.password?.message}
      />

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
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
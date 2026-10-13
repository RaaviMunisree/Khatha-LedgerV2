import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LoginForm from "../components/LoginForm";

import {
  getApiErrorMessage,
} from "../../../lib/api/api-error";

import type {
  LoginFormData,
} from "../schemas/auth.schema";

import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [serverError, setServerError] =
    useState("");

  const registrationMessage =
    (
      location.state as
        | { message?: string }
        | null
        | undefined
    )?.message;

  const handleSubmit = async (
    data: LoginFormData,
  ) => {
    setServerError("");

    try {
      const user = await login(data);

      if (user.role === "SHOP_OWNER") {
        navigate("/owner/dashboard", {
          replace: true,
        });

        return;
      }

      if (user.role === "CUSTOMER") {
        navigate("/customer/dashboard", {
          replace: true,
        });

        return;
      }

      navigate("/unauthorized", {
        replace: true,
      });
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Login failed.",
        ),
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome back
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Sign in to your KhataX account.
        </p>
      </div>

      {registrationMessage && (
        <div className="mb-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {registrationMessage}
        </div>
      )}

      <LoginForm
        onSubmit={handleSubmit}
        serverError={serverError}
      />

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-slate-900 hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
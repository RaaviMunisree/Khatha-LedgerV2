import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";


import {
  registerUser,
} from "../api/auth.api";

import {
  getApiErrorMessage,
} from "../../../lib/api/api-error";

import type {
  RegisterFormData,
} from "../schemas/auth.schema";
import RegisterForm from "../components/RegistrationForm";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [serverError, setServerError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    data: RegisterFormData,
  ) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      const response =
        await registerUser(data);

      navigate("/login", {
        replace: true,
        state: {
          message:
            response.message ||
            "Registration successful. Please log in.",
        },
      });
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Registration failed.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Create your account
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Start using KhataX.
        </p>
      </div>

      <RegisterForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        serverError={serverError}
      />

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-slate-900 hover:underline"
        >
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
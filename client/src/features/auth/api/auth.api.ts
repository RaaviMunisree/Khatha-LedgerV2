import { apiClient } from "../../../lib/api/client";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";

export const loginUser = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const response =
    await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );

  return response.data;
};

export const registerUser = async (
  payload: RegisterRequest,
): Promise<RegisterResponse> => {
  const response =
    await apiClient.post<RegisterResponse>(
      "/auth/register",
      payload,
    );

  return response.data;
};
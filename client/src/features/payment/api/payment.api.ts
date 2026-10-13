import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreatePaymentInput,
  Payment,
} from "../types/payment.types";
import { apiClient } from "../../../lib/api/client";

const shopBase = (shopId: string) => `/shops/${shopId}`;

export const createPayment = async (
  shopId: string,
  payload: CreatePaymentInput,
): Promise<ApiResponse<Payment>> => {
  const res = await apiClient.post<ApiResponse<Payment>>(
    `${shopBase(shopId)}/payments`,
    payload,
  );
  return res.data;
};

export const getCustomerPayments = async (
  shopId: string,
  customerId: string,
): Promise<ApiResponse<Payment[]>> => {
  const res = await apiClient.get<ApiResponse<Payment[]>>(
    `${shopBase(shopId)}/customers/${customerId}/payments`,
  );
  return res.data;
};

export const getCustomerPaymentHistory = async (
  shopId: string,
  customerId: string,
): Promise<ApiResponse<Payment[]>> => {
  const res = await apiClient.get<ApiResponse<Payment[]>>(
    `${shopBase(shopId)}/customers/${customerId}/payments-history`,
  );
  return res.data;
};

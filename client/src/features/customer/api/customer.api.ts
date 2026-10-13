import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreateCustomerInput,
  Customer,
  UpdateCustomerInput,
} from "../types/customer.types";
import { apiClient } from "../../../lib/api/client";

const shopBase = (shopId: string) => `/shops/${shopId}`;

export const createCustomer = async (
  shopId: string,
  payload: CreateCustomerInput,
): Promise<ApiResponse<Customer>> => {
  const res = await apiClient.post<ApiResponse<Customer>>(
    `${shopBase(shopId)}/customers`,
    payload,
  );
  return res.data;
};

export const getCustomers = async (
  shopId: string,
): Promise<ApiResponse<Customer[]>> => {
  const res = await apiClient.get<ApiResponse<Customer[]>>(
    `${shopBase(shopId)}/customers`,
  );
  return res.data;
};

export const getCustomerById = async (
  shopId: string,
  customerId: string,
): Promise<ApiResponse<Customer>> => {
  const res = await apiClient.get<ApiResponse<Customer>>(
    `${shopBase(shopId)}/customers/${customerId}`,
  );
  return res.data;
};

export const updateCustomer = async (
  shopId: string,
  customerId: string,
  payload: UpdateCustomerInput,
): Promise<ApiResponse<Customer>> => {
  const res = await apiClient.put<ApiResponse<Customer>>(
    `${shopBase(shopId)}/customers/${customerId}`,
    payload,
  );
  return res.data;
};

export const deactivateCustomer = async (
  shopId: string,
  customerId: string,
): Promise<ApiResponse<Customer>> => {
  const res = await apiClient.patch<ApiResponse<Customer>>(
    `${shopBase(shopId)}/customers/${customerId}/deactivate`,
  );
  return res.data;
};

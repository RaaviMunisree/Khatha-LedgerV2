import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreateInvoiceInput,
  Invoice,
} from "../types/invoice.types";
import { apiClient } from "../../../lib/api/client";

const shopBase = (shopId: string) => `/shops/${shopId}`;

export const createInvoice = async (
  shopId: string,
  payload: CreateInvoiceInput,
): Promise<ApiResponse<Invoice>> => {
  const res = await apiClient.post<ApiResponse<Invoice>>(
    `${shopBase(shopId)}/invoices`,
    payload,
  );
  return res.data;
};

export const getInvoices = async (
  shopId: string,
): Promise<ApiResponse<Invoice[]>> => {
  const res = await apiClient.get<ApiResponse<Invoice[]>>(
    `${shopBase(shopId)}/invoices`,
  );
  return res.data;
};

export const getInvoiceById = async (
  shopId: string,
  invoiceId: string,
): Promise<ApiResponse<Invoice>> => {
  const res = await apiClient.get<ApiResponse<Invoice>>(
    `${shopBase(shopId)}/invoices/${invoiceId}`,
  );
  return res.data;
};

export const cancelInvoice = async (
  shopId: string,
  invoiceId: string,
): Promise<ApiResponse<Invoice>> => {
  const res = await apiClient.patch<ApiResponse<Invoice>>(
    `${shopBase(shopId)}/invoices/${invoiceId}/cancel`,
  );
  return res.data;
};

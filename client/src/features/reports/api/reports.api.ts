import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  InventoryReport,
  PaymentReport,
  SalesReport,
} from "../types/reports.types";
import { apiClient } from "../../../lib/api/client";

const shopBase = (shopId: string) => `/shops/${shopId}/reports`;

export const getSalesReport = async (
  shopId: string,
): Promise<ApiResponse<SalesReport>> => {
  const res = await apiClient.get<ApiResponse<SalesReport>>(
    `${shopBase(shopId)}/sales`,
  );
  return res.data;
};

export const getPaymentReport = async (
  shopId: string,
): Promise<ApiResponse<PaymentReport>> => {
  const res = await apiClient.get<ApiResponse<PaymentReport>>(
    `${shopBase(shopId)}/payments`,
  );
  return res.data;
};

export const getInventoryReport = async (
  shopId: string,
): Promise<ApiResponse<InventoryReport>> => {
  const res = await apiClient.get<ApiResponse<InventoryReport>>(
    `${shopBase(shopId)}/inventory`,
  );
  return res.data;
};

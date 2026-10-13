import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreateLedgerEntryInput,
  LedgerEntry,
} from "../types/ledger.types";
import { apiClient } from "../../../lib/api/client";

const shopBase = (shopId: string) => `/shops/${shopId}`;

export const createLedgerEntry = async (
  shopId: string,
  payload: CreateLedgerEntryInput,
): Promise<ApiResponse<LedgerEntry>> => {
  const res = await apiClient.post<ApiResponse<LedgerEntry>>(
    `${shopBase(shopId)}/ledger`,
    payload,
  );
  return res.data;
};

export const getCustomerLedger = async (
  shopId: string,
  customerId: string,
): Promise<ApiResponse<LedgerEntry[]>> => {
  const res = await apiClient.get<ApiResponse<LedgerEntry[]>>(
    `${shopBase(shopId)}/customers/${customerId}/ledger`,
  );
  return res.data;
};

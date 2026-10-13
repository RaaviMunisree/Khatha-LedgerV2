import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreateInventoryTxInput,
  InventoryTransaction,
} from "../types/inventory.types";
import { apiClient } from "../../../lib/api/client";

const productBase = (shopId: string, productId: string) =>
  `/shops/${shopId}/products/${productId}`;

export const createInventoryTransaction = async (
  shopId: string,
  productId: string,
  payload: CreateInventoryTxInput,
): Promise<ApiResponse<InventoryTransaction>> => {
  const res = await apiClient.post<ApiResponse<InventoryTransaction>>(
    `${productBase(shopId, productId)}/inventory`,
    payload,
  );
  return res.data;
};

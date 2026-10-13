import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreateShopInput,
  Shop,
  UpdateShopInput,
} from "../types/shop.types";

import { apiClient } from "../../../lib/api/client";

const BASE = "/shops";

export const createShop = async (
  payload: CreateShopInput,
): Promise<ApiResponse<Shop>> => {
  const res = await apiClient.post<ApiResponse<Shop>>(BASE, payload);
  return res.data;
};

export const getMyShops = async (): Promise<ApiResponse<Shop[]>> => {
  const res = await apiClient.get<ApiResponse<Shop[]>>(BASE);
  return res.data;
};

export const getShopById = async (
  id: string,
): Promise<ApiResponse<Shop>> => {
  const res = await apiClient.get<ApiResponse<Shop>>(`${BASE}/${id}`);
  return res.data;
};

export const updateShop = async (
  id: string,
  payload: UpdateShopInput,
): Promise<ApiResponse<Shop>> => {
  const res = await apiClient.put<ApiResponse<Shop>>(
    `${BASE}/${id}`,
    payload,
  );
  return res.data;
};

export const deactivateShop = async (
  id: string,
): Promise<ApiResponse<Shop>> => {
  const res = await apiClient.patch<ApiResponse<Shop>>(
    `${BASE}/${id}/deactivate`,
  );
  return res.data;
};

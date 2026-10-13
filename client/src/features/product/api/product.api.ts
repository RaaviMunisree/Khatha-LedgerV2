import type { ApiResponse } from "../../../lib/api/api.types";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "../types/product.types";
import { apiClient } from "../../../lib/api/client";

const shopBase = (shopId: string) => `/shops/${shopId}`;

export const createProduct = async (
  shopId: string,
  payload: CreateProductInput,
): Promise<ApiResponse<Product>> => {
  const res = await apiClient.post<ApiResponse<Product>>(
    `${shopBase(shopId)}/products`,
    payload,
  );
  return res.data;
};

export const getProducts = async (
  shopId: string,
): Promise<ApiResponse<Product[]>> => {
  const res = await apiClient.get<ApiResponse<Product[]>>(
    `${shopBase(shopId)}/products`,
  );
  return res.data;
};

export const getProductById = async (
  shopId: string,
  productId: string,
): Promise<ApiResponse<Product>> => {
  const res = await apiClient.get<ApiResponse<Product>>(
    `${shopBase(shopId)}/products/${productId}`,
  );
  return res.data;
};

export const updateProduct = async (
  shopId: string,
  productId: string,
  payload: UpdateProductInput,
): Promise<ApiResponse<Product>> => {
  const res = await apiClient.put<ApiResponse<Product>>(
    `${shopBase(shopId)}/products/${productId}`,
    payload,
  );
  return res.data;
};

export const deactivateProduct = async (
  shopId: string,
  productId: string,
): Promise<ApiResponse<Product>> => {
  const res = await apiClient.patch<ApiResponse<Product>>(
    `${shopBase(shopId)}/products/${productId}/deactivate`,
  );
  return res.data;
};

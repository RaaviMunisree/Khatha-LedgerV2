import type { Timestamped } from "../../../lib/api/api.types";

export type ProductUnit =
  | "PCS"
  | "KG"
  | "GRAM"
  | "LITRE"
  | "ML"
  | "BOX"
  | "PACK";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Product extends Timestamped {
  _id: string;
  shopId: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  currentStock: number;
  minimumStock: number;
  unit: ProductUnit;
  status: ProductStatus;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate?: number;
  currentStock?: number;
  minimumStock?: number;
  unit: ProductUnit;
}

export type UpdateProductInput = Partial<CreateProductInput>;

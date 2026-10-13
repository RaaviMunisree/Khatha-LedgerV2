import type { Timestamped } from "../../../lib/api/api.types";

export type BusinessType =
  | "GROCERY"
  | "RETAIL"
  | "PHARMACY"
  | "ELECTRONICS"
  | "OTHER";

export type ShopStatus = "ACTIVE" | "INACTIVE";

export interface Shop extends Timestamped {
  _id: string;
  name: string;
  ownerId: string;
  businessType: BusinessType;
  phone?: string;
  address?: string;
  status: ShopStatus;
}

export interface CreateShopInput {
  name: string;
  businessType: BusinessType;
  phone?: string;
  address?: string;
}

export type UpdateShopInput = Partial<CreateShopInput>;

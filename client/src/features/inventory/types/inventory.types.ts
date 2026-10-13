import type { Timestamped } from "../../../lib/api/api.types";

export type InventoryType =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGE"
  | "EXPIRY"
  | "ADJUSTMENT";

export type ReferenceType =
  | "INVOICE"
  | "PURCHASE"
  | "RETURN"
  | "MANUAL";

export interface InventoryTransaction extends Timestamped {
  _id: string;
  shopId: string;
  productId: string;
  type: InventoryType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: ReferenceType;
  referenceId?: string;
  performedBy: string;
}

export interface CreateInventoryTxInput {
  type: InventoryType;
  quantity: number;
  referenceType?: ReferenceType;
  note?: string;
}

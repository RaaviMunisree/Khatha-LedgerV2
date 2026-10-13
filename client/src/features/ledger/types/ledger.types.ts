import type { Timestamped } from "../../../lib/api/api.types";

export type LedgerType = "CREDIT" | "DEBIT" | "ADJUSTMENT";
export type LedgerRefType =
  | "INVOICE"
  | "PAYMENT"
  | "ADJUSTMENT"
  | "MANUAL";

export interface LedgerEntry extends Timestamped {
  _id: string;
  shopId: string;
  customerId: string;
  type: LedgerType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceType?: LedgerRefType;
  referenceId?: string;
  createdBy: string;
}

export interface CreateLedgerEntryInput {
  customerId: string;
  type: LedgerType;
  amount: number;
  description?: string;
  referenceType?: LedgerRefType;
  referenceId?: string;
}

import type { Timestamped } from "../../../lib/api/api.types";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "ONLINE_GATEWAY";

export interface Payment extends Timestamped {
  _id: string;
  shopId: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  status: PaymentStatus;
  receivedBy: string;
  notes?: string;
  gateway?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  paidAt?: string;
  refundedAmount: number;
}

export interface CreatePaymentInput {
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
}

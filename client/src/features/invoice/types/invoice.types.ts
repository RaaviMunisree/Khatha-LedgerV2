import type { Timestamped } from "../../../lib/api/api.types";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIAL"
  | "PAID";

export type InvoiceStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Invoice extends Timestamped {
  _id: string;
  shopId: string;
  customerId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  status: InvoiceStatus;
  createdBy: string;
}

export interface CreateInvoiceItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export interface CreateInvoiceInput {
  customerId: string;
  items: CreateInvoiceItemInput[];
  discount?: number;
}

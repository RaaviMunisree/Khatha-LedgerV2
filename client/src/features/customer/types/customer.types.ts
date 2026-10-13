import type { Timestamped } from "../../../lib/api/api.types";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface Customer extends Timestamped {
  _id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  currentOutstanding: number;
  status: CustomerStatus;
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit?: number;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

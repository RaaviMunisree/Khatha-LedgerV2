export interface SalesReport {
  totalSales: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  periodSales: {
    label: string;
    value: number;
  }[];
  topProducts: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface PaymentReport {
  totalCollected: number;
  byMethod: Record<string, number>;
  periodPayments: {
    label: string;
    value: number;
  }[];
}

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockItems: number;
  topStocked: {
    name: string;
    stock: number;
  }[];
}

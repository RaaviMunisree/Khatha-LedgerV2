import { useQuery } from "@tanstack/react-query";
import {
  getInventoryReport,
  getPaymentReport,
  getSalesReport,
} from "../features/reports/api/reports.api";

export const salesReportKey = (shopId: string | null | undefined) =>
  ["reports", shopId, "sales"] as const;
export const paymentReportKey = (shopId: string | null | undefined) =>
  ["reports", shopId, "payments"] as const;
export const inventoryReportKey = (shopId: string | null | undefined) =>
  ["reports", shopId, "inventory"] as const;

export function useSalesReport(shopId: string | null | undefined) {
  return useQuery({
    queryKey: salesReportKey(shopId ?? ""),
    enabled: Boolean(shopId),
    queryFn: async () => {
      const res = await getSalesReport(shopId as string);
      return res.data;
    },
  });
}

export function usePaymentReport(shopId: string | null | undefined) {
  return useQuery({
    queryKey: paymentReportKey(shopId ?? ""),
    enabled: Boolean(shopId),
    queryFn: async () => {
      const res = await getPaymentReport(shopId as string);
      return res.data;
    },
  });
}

export function useInventoryReport(shopId: string | null | undefined) {
  return useQuery({
    queryKey: inventoryReportKey(shopId ?? ""),
    enabled: Boolean(shopId),
    queryFn: async () => {
      const res = await getInventoryReport(shopId as string);
      return res.data;
    },
  });
}

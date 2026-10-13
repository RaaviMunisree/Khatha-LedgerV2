import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  cancelInvoice,
  createInvoice,
  getInvoiceById,
  getInvoices,
} from "../features/invoice/api/invoice.api";
import type { CreateInvoiceInput } from "../features/invoice/types/invoice.types";
import { getApiErrorMessage } from "../lib/api/api-error";

export const invoicesQueryKey = (shopId: string | null | undefined) =>
  ["shops", shopId, "invoices"] as const;

export const invoiceQueryKey = (shopId: string | null | undefined, invoiceId: string) =>
  ["shops", shopId, "invoices", invoiceId] as const;

export function useInvoices(shopId: string | null | undefined) {
  return useQuery({
    queryKey: invoicesQueryKey(shopId ?? ""),
    enabled: Boolean(shopId),
    queryFn: async () => {
      const res = await getInvoices(shopId as string);
      return res.data;
    },
  });
}

export function useInvoice(
  shopId: string | null | undefined,
  invoiceId: string | undefined,
) {
  return useQuery({
    queryKey: invoiceQueryKey(shopId ?? "", invoiceId ?? ""),
    enabled: Boolean(shopId) && Boolean(invoiceId),
    queryFn: async () => {
      const res = await getInvoiceById(shopId as string, invoiceId as string);
      return res.data;
    },
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      input: CreateInvoiceInput;
    }) => createInvoice(args.shopId, args.input),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: invoicesQueryKey(args.shopId),
      });
      toast.success(res.message || "Invoice created");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not create invoice"));
    },
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { shopId: string; invoiceId: string }) =>
      cancelInvoice(args.shopId, args.invoiceId),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: invoicesQueryKey(args.shopId),
      });
      qc.invalidateQueries({
        queryKey: invoiceQueryKey(args.shopId, args.invoiceId),
      });
      toast.success(res.message || "Invoice cancelled");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not cancel invoice"));
    },
  });
}

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createPayment,
  getCustomerPayments,
  getCustomerPaymentHistory,
} from "../features/payment/api/payment.api";
import type { CreatePaymentInput } from "../features/payment/types/payment.types";
import { getApiErrorMessage } from "../lib/api/api-error";

export const customerPaymentsQueryKey = (
  shopId: string,
  customerId: string,
) =>
  ["shops", shopId, "customers", customerId, "payments"] as const;

export const customerPaymentsHistoryQueryKey = (
  shopId: string,
  customerId: string,
) =>
  ["shops", shopId, "customers", customerId, "payments-history"] as const;

export function useCustomerPayments(
  shopId: string | undefined,
  customerId: string | undefined,
) {
  return useQuery({
    queryKey: customerPaymentsQueryKey(shopId ?? "", customerId ?? ""),
    enabled: Boolean(shopId) && Boolean(customerId),
    queryFn: async () => {
      const res = await getCustomerPayments(
        shopId as string,
        customerId as string,
      );
      return res.data;
    },
  });
}

export function useCustomerPaymentHistory(
  shopId: string | null | undefined,
  customerId: string | undefined,
) {
  return useQuery({
    queryKey: customerPaymentsHistoryQueryKey(shopId ?? "", customerId ?? ""),
    enabled: Boolean(shopId) && Boolean(customerId),
    queryFn: async () => {
      const res = await getCustomerPaymentHistory(
        shopId as string,
        customerId as string,
      );
      return res.data;
    },
  });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      input: CreatePaymentInput;
    }) => createPayment(args.shopId, args.input),
    onSuccess: (res, args) => {
      if (args.input.customerId) {
        qc.invalidateQueries({
          queryKey: customerPaymentsQueryKey(
            args.shopId,
            args.input.customerId,
          ),
        });
        qc.invalidateQueries({
          queryKey: customerPaymentsHistoryQueryKey(
            args.shopId,
            args.input.customerId,
          ),
        });
      }
      toast.success(res.message || "Payment recorded");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not record payment"));
    },
  });
}

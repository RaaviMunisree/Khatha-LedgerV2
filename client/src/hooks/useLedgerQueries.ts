import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createLedgerEntry,
  getCustomerLedger,
} from "../features/ledger/api/ledger.api";
import type { CreateLedgerEntryInput } from "../features/ledger/types/ledger.types";
import { getApiErrorMessage } from "../lib/api/api-error";

export const customerLedgerQueryKey = (
  shopId: string | null | undefined,
  customerId: string,
) =>
  ["shops", shopId, "customers", customerId, "ledger"] as const;

export function useCustomerLedger(
  shopId: string | null | undefined,
  customerId: string | undefined,
) {
  return useQuery({
    queryKey: customerLedgerQueryKey(shopId ?? "", customerId ?? ""),
    enabled: Boolean(shopId) && Boolean(customerId),
    queryFn: async () => {
      const res = await getCustomerLedger(
        shopId as string,
        customerId as string,
      );
      return res.data;
    },
  });
}

export function useCreateLedgerEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      input: CreateLedgerEntryInput;
    }) => createLedgerEntry(args.shopId, args.input),
    onSuccess: (res, args) => {
      if (args.input.customerId) {
        qc.invalidateQueries({
          queryKey: customerLedgerQueryKey(
            args.shopId,
            args.input.customerId,
          ),
        });
      }
      toast.success(res.message || "Ledger entry added");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not add ledger entry"));
    },
  });
}

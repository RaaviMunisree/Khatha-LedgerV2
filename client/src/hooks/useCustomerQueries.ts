import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createCustomer,
  deactivateCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../features/customer/api/customer.api";
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../features/customer/types/customer.types";
import { getApiErrorMessage } from "../lib/api/api-error";

export const customersQueryKey = (shopId: string | null | undefined) =>
  ["shops", shopId, "customers"] as const;

export const customerQueryKey = (shopId: string | null | undefined, customerId: string) =>
  ["shops", shopId, "customers", customerId] as const;

export function useCustomers(shopId: string | null | undefined) {
  return useQuery({
    queryKey: customersQueryKey(shopId ?? ""),
    enabled: Boolean(shopId),
    queryFn: async () => {
      const res = await getCustomers(shopId as string);
      return res.data;
    },
  });
}

export function useCustomer(
  shopId: string | null | undefined,
  customerId: string | undefined,
) {
  return useQuery({
    queryKey: customerQueryKey(shopId ?? "", customerId ?? ""),
    enabled: Boolean(shopId) && Boolean(customerId),
    queryFn: async () => {
      const res = await getCustomerById(shopId as string, customerId as string);
      return res.data;
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      input: CreateCustomerInput;
    }) => createCustomer(args.shopId, args.input),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: customersQueryKey(args.shopId),
      });
      toast.success(res.message || "Customer created");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not create customer"));
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      customerId: string;
      input: UpdateCustomerInput;
    }) =>
      updateCustomer(args.shopId, args.customerId, args.input),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: customersQueryKey(args.shopId),
      });
      qc.invalidateQueries({
        queryKey: customerQueryKey(args.shopId, args.customerId),
      });
      toast.success(res.message || "Customer updated");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not update customer"));
    },
  });
}

export function useDeactivateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { shopId: string; customerId: string }) =>
      deactivateCustomer(args.shopId, args.customerId),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: customersQueryKey(args.shopId),
      });
      qc.invalidateQueries({
        queryKey: customerQueryKey(args.shopId, args.customerId),
      });
      toast.success(res.message || "Customer deactivated");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Could not deactivate customer"),
      );
    },
  });
}

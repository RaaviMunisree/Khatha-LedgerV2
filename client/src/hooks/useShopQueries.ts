import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createShop,
  deactivateShop,
  getMyShops,
  getShopById,
  updateShop,
} from "../features/shop/api/shop.api";
import type {
  CreateShopInput,
  UpdateShopInput,
} from "../features/shop/types/shop.types";
import { getApiErrorMessage } from "../lib/api/api-error";

export const SHOPS_QUERY_KEY = ["shops"] as const;
export const shopQueryKey = (id: string | null | undefined) =>
  [...SHOPS_QUERY_KEY, id] as const;

export function useMyShops() {
  return useQuery({
    queryKey: SHOPS_QUERY_KEY,
    queryFn: async () => {
      const res = await getMyShops();
      return res.data;
    },
  });
}

export function useShop(id: string | null | undefined) {
  return useQuery({
    queryKey: shopQueryKey(id ?? ""),
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await getShopById(id as string);
      return res.data;
    },
  });
}

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateShopInput) => createShop(input),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: SHOPS_QUERY_KEY });
      toast.success(res.message || "Shop created");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not create shop"));
    },
  });
}

export function useUpdateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; input: UpdateShopInput }) =>
      updateShop(args.id, args.input),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: SHOPS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: shopQueryKey(vars.id) });
      toast.success(res.message || "Shop updated");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not update shop"));
    },
  });
}

export function useDeactivateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateShop(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: SHOPS_QUERY_KEY });
      qc.invalidateQueries({ queryKey: shopQueryKey(id) });
      toast.success(res.message || "Shop deactivated");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not deactivate shop"));
    },
  });
}

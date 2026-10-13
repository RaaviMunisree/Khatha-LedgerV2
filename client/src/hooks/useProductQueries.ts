import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProduct,
  deactivateProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../features/product/api/product.api";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../features/product/types/product.types";
import { getApiErrorMessage } from "../lib/api/api-error";

export const productsQueryKey = (shopId: string | null | undefined) =>
  ["shops", shopId, "products"] as const;

export const productQueryKey = (shopId: string | null | undefined, productId: string) =>
  ["shops", shopId, "products", productId] as const;

export function useProducts(shopId: string | null | undefined) {
  return useQuery({
    queryKey: productsQueryKey(shopId ?? ""),
    enabled: Boolean(shopId),
    queryFn: async () => {
      const res = await getProducts(shopId as string);
      return res.data;
    },
  });
}

export function useProduct(
  shopId: string | null | undefined,
  productId: string | undefined,
) {
  return useQuery({
    queryKey: productQueryKey(shopId ?? "", productId ?? ""),
    enabled: Boolean(shopId) && Boolean(productId),
    queryFn: async () => {
      const res = await getProductById(shopId as string, productId as string);
      return res.data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      input: CreateProductInput;
    }) => createProduct(args.shopId, args.input),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: productsQueryKey(args.shopId),
      });
      toast.success(res.message || "Product created");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not create product"));
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      shopId: string;
      productId: string;
      input: UpdateProductInput;
    }) =>
      updateProduct(args.shopId, args.productId, args.input),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: productsQueryKey(args.shopId),
      });
      qc.invalidateQueries({
        queryKey: productQueryKey(args.shopId, args.productId),
      });
      toast.success(res.message || "Product updated");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Could not update product"));
    },
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { shopId: string; productId: string }) =>
      deactivateProduct(args.shopId, args.productId),
    onSuccess: (res, args) => {
      qc.invalidateQueries({
        queryKey: productsQueryKey(args.shopId),
      });
      qc.invalidateQueries({
        queryKey: productQueryKey(args.shopId, args.productId),
      });
      toast.success(res.message || "Product deactivated");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Could not deactivate product"),
      );
    },
  });
}

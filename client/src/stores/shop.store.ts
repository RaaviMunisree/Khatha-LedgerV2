import { create } from "zustand";
import type { Shop } from "../features/shop/types/shop.types";

interface ShopStore {
  currentShop: Shop | null;
  currentShopId: string | null;
  shops: Shop[];
  setShops: (shops: Shop[]) => void;
  setCurrentShop: (shop: Shop | null) => void;
  setCurrentShopId: (id: string | null) => void;
}

export const useShopStore = create<ShopStore>((set) => ({
  currentShop: null,
  currentShopId: null,
  shops: [],
  setShops: (shops) => set({ shops }),
  setCurrentShop: (shop) =>
    set({
      currentShop: shop,
      currentShopId: shop?._id ?? null,
    }),
  setCurrentShopId: (id) => set({ currentShopId: id }),
}));

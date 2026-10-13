import { Outlet } from "react-router-dom";
import { useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Toaster } from "../components/ui/Toaster";

import { useUIStore } from "../stores/ui.store";
import { useMyShops } from "../hooks/useShopQueries";
import { useShopStore } from "../stores/shop.store";
import { useAuth } from "../features/auth/hooks/useAuth";

export default function DashboardLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobile = useUIStore((s) => s.setMobileSidebarOpen);

  const { user } = useAuth();
  const { data: shops } = useMyShops();
  const currentShopId = useShopStore((s) => s.currentShopId);
  const setCurrentShop = useShopStore((s) => s.setCurrentShop);

  useEffect(() => {
    if (user?.role !== "SHOP_OWNER") return;
    if (!shops?.length) return;
    if (currentShopId) return;
    setCurrentShop(shops[0]!);
  }, [shops, currentShopId, setCurrentShop, user?.role]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        collapsed={!sidebarOpen}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobile(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}

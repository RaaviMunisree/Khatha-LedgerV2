import { useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  Menu,
  Search,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import Button from "../../components/ui/Button";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useUIStore } from "../../stores/ui.store";
import { useShopStore } from "../../stores/shop.store";
import { cn } from "../../lib/utils";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toggleMobile = useUIStore(
    (s) => s.toggleMobileSidebar,
  );
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const currentShop = useShopStore((s) => s.currentShop);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobile}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden lg:inline-flex"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden md:block">
          <p className="text-sm font-semibold text-slate-900">
            {currentShop?.name ??
              (user?.role === "CUSTOMER"
                ? "My KhataX Account"
                : "KhataX")}
          </p>
          <p className="text-xs text-slate-500">
            {user?.role === "SHOP_OWNER"
              ? "Shop Owner Workspace"
              : user?.role === "CUSTOMER"
                ? "Customer Portal"
                : "KhataX"}
          </p>
        </div>
      </div>

      <div className="hidden flex-1 max-w-md px-6 lg:block">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
          <Search className="mr-2 h-4 w-4" />
          <input
            disabled
            placeholder="Search customers, products, invoices..."
            className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 md:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1 pr-3 py-1 shadow-sm transition hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-xs font-semibold text-white">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : <UserIcon className="h-4 w-4" />}
            </span>
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user?.name ?? "Account"}
            </span>
          </button>

          {menuOpen && (
            <div
              className={cn(
                "absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-lg slide-in",
              )}
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-sm font-medium text-slate-900">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email ?? user?.phone ?? ""}
                </p>
                <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

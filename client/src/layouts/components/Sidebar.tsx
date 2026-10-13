import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  ChevronRight,
} from "lucide-react";

import { cn } from "../../lib/utils";
import {
  ownerNavItems,
  customerNavItems,
  navGroupLabels,
  type NavItem,
} from "../../config/navigation";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useShopStore } from "../../stores/shop.store";
import { useMyShops } from "../../hooks/useShopQueries";

interface SidebarProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function NavRow({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed?: boolean;
}) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  const isActive =
    pathname === item.to ||
    (item.to !== "/owner/dashboard" &&
      item.to !== "/customer/dashboard" &&
      pathname.startsWith(item.to));

  return (
    <NavLink
      to={item.to}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        isActive
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          !isActive && "text-slate-500 group-hover:text-slate-700",
        )}
      />
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && isActive && (
        <ChevronRight className="ml-auto h-4 w-4 text-white/60" />
      )}
    </NavLink>
  );
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user } = useAuth();
  const currentShop = useShopStore((s) => s.currentShop);
  const setCurrentShop = useShopStore((s) => s.setCurrentShop);
  const { data: shops } = useMyShops();

  const navItems =
    user?.role === "CUSTOMER"
      ? customerNavItems
      : ownerNavItems;

  const groups = Array.from(
    new Set(navItems.map((n) => n.group ?? "other")),
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-200",
          collapsed ? "w-[76px]" : "w-64",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b border-slate-200 px-4 py-4",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                KhataX
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Business Platform
              </p>
            </div>
          )}
        </div>

        {user?.role === "SHOP_OWNER" && !collapsed && (
          <div className="border-b border-slate-200 p-4">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Shop
            </label>
            <select
              value={currentShop?._id ?? ""}
              onChange={(e) => {
                const shop =
                  shops?.find((s) => s._id === e.target.value) ??
                  null;
                setCurrentShop(shop);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {!shops?.length && (
                <option value="">No shops yet</option>
              )}
              {shops?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            {!shops?.length && (
              <p className="mt-2 text-xs text-slate-500">
                Create your first shop from Settings.
              </p>
            )}
          </div>
        )}

        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          {groups.map((group) => {
            const items = navItems.filter(
              (n) => (n.group ?? "other") === group,
            );
            if (!items.length) return null;
            return (
              <div key={group} className="space-y-1">
                {group !== "other" && !collapsed && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {navGroupLabels[group] ?? group}
                  </p>
                )}
                {items.map((item) => (
                  <NavRow
                    key={item.to}
                    item={item}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            );
          })}
        </nav>

        <div
          className={cn(
            "border-t border-slate-200 p-3",
            collapsed && "flex justify-center",
          )}
        >
          {!collapsed ? (
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">
                Tip
              </p>
              <p className="mt-1 leading-relaxed text-slate-600">
                Start by creating customers and products, then
                generate invoices.
              </p>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-full bg-slate-100" />
          )}
        </div>
      </aside>
    </>
  );
}

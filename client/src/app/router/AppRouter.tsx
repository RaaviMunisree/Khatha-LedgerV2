import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";
import DashboardLayout from "../../layouts/DashboardLayout";

import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import SimplePage from "../../features/auth/pages/SimplePage";

import OwnerDashboardPage from "../../features/dashboard/pages/OwnerDashboardPage";
import CustomerDashboardPage from "../../features/dashboard/pages/CustomerDashboardPage";

import CustomersPage from "../../features/customer/pages/CustomersPage";
import ProductsPage from "../../features/product/pages/ProductsPage";
import InventoryPage from "../../features/inventory/pages/InventoryPage";
import InvoicesPage from "../../features/invoice/pages/InvoicesPage";
import PaymentsPage from "../../features/payment/pages/PaymentsPage";
import LedgerPage from "../../features/ledger/pages/LedgerPage";
import ReportsPage from "../../features/reports/pages/ReportsPage";
import AIAssistantPage from "../../features/ai/pages/AIAssistantPage";
import SettingsPage from "../../features/settings/pages/SettingsPage";

import NotFoundPage from "../../pages/NotFoundPage";

import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../../features/auth/hooks/useAuth";

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  switch (user.role) {
    case "SHOP_OWNER":
    case "ADMIN":
    case "EMPLOYEE":
      return (
        <Navigate
          to="/owner/dashboard"
          replace
        />
      );
    case "CUSTOMER":
      return (
        <Navigate
          to="/customer/dashboard"
          replace
        />
      );
    default:
      return (
        <Navigate
          to="/login"
          replace
        />
      );
  }
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />
      </Route>

      {/* Root role-aware redirect */}
      <Route
        path="/"
        element={<RootRedirect />}
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <SimplePage
            title="Unauthorized"
            description="You do not have permission to access this page."
          />
        }
      />

      {/* Owner routes (SHOP_OWNER, ADMIN, EMPLOYEE) */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "SHOP_OWNER",
              "ADMIN",
              "EMPLOYEE",
            ]}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/owner/dashboard"
            element={<OwnerDashboardPage />}
          />
          <Route
            path="/owner/customers"
            element={<CustomersPage />}
          />
          <Route
            path="/owner/products"
            element={<ProductsPage />}
          />
          <Route
            path="/owner/inventory"
            element={<InventoryPage />}
          />
          <Route
            path="/owner/invoices"
            element={<InvoicesPage />}
          />
          <Route
            path="/owner/payments"
            element={<PaymentsPage />}
          />
          <Route
            path="/owner/ledger"
            element={<LedgerPage />}
          />
          <Route
            path="/owner/reports"
            element={<ReportsPage />}
          />
          <Route
            path="/owner/ai"
            element={<AIAssistantPage />}
          />
          <Route
            path="/owner/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>

      {/* Customer routes */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={["CUSTOMER"]}
          />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            path="/customer/dashboard"
            element={<CustomerDashboardPage />}
          />
          <Route
            path="/customer/invoices"
            element={<InvoicesPage />}
          />
          <Route
            path="/customer/payments"
            element={<PaymentsPage />}
          />
          <Route
            path="/customer/ledger"
            element={<LedgerPage />}
          />
          <Route
            path="/customer/ai"
            element={<AIAssistantPage />}
          />
          <Route
            path="/customer/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>

      {/* 404 Not Found */}
      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
};

export default AppRouter;

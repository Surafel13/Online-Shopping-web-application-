import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "./redux/store";
import { restoreSession } from "./redux/slices/authSlice";
import { fetchCart } from "./redux/slices/cartSlice";
import { fetchWishlist } from "./redux/slices/wishlistSlice";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { SuperAdminRoute } from "./components/auth/SuperAdminRoute";

import { FeedbackToast } from "./components/shared/FeedbackToast";

import { Home } from "./pages/Home";
import { Collections } from "./pages/Collections";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Categories } from "./pages/Categories";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Orders } from "./pages/Orders";
import { Wishlist } from "./pages/Wishlist";

import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminCategories } from "./pages/admin/AdminCategories";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminSettings } from "./pages/admin/AdminSettings";

import {
  AdminAddProduct,
  AdminInventory,
  AdminPayments,
  AdminRefunds,
  AdminSellers,
  AdminPromotions,
  AdminCoupons,
  AdminReviews,
  AdminSupport,
  AdminDisputes,
  AdminNotifications,
  AdminSalesReports,
  AdminRevenueReports,
  AdminProductPerformance,
  AdminChangePassword,
} from "./pages/admin/AdminPlaceholderSections";

import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import { SuperAdminOverview } from "./pages/superadmin/SuperAdminOverview";
import { AdminManagement } from "./pages/superadmin/AdminManagement";
import { PermissionsManagement } from "./pages/superadmin/PermissionsManagement";

import {
  SuperAdminUsers,
  SuperAdminProducts,
  SuperAdminCategories,
  SuperAdminOrders,
  SuperAdminPayments,
  SuperAdminReviews,
  SuperAdminReports,
  SuperAdminInventory,
  SuperAdminActivityLogs,
  SuperAdminSettings,
  SuperAdminProfile,
} from "./pages/superadmin/SuperAdminSections";

import {
  AboutPage,
  ContactPage,
  NotificationsPage,
  AddressesPage,
  AccountSettingsPage,
} from "./pages/PlaceholderPages";

function App() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/super-admin");

  const theme = useSelector((state: RootState) => state.theme.theme);

  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  if (!isInitialized && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans antialiased text-foreground">
      {!isAdminRoute && <Header />}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/settings"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />

            {/* Catalog Management */}
            <Route path="products" element={<AdminProducts />} />
            <Route path="add-product" element={<AdminAddProduct />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<AdminInventory />} />

            {/* Sales Management */}
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="refunds" element={<AdminRefunds />} />

            {/* User Management */}
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="sellers" element={<AdminSellers />} />

            {/* Marketing */}
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="coupons" element={<AdminCoupons />} />

            {/* Customer Engagement */}
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="notifications" element={<AdminNotifications />} />

            {/* Analytics */}
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="analytics/sales" element={<AdminSalesReports />} />
            <Route path="analytics/revenue" element={<AdminRevenueReports />} />
            <Route
              path="analytics/products"
              element={<AdminProductPerformance />}
            />

            {/* Account Settings */}
            <Route path="settings" element={<AdminSettings />} />
            <Route path="change-password" element={<AdminChangePassword />} />
          </Route>

          {/* Super Admin Routes */}
          <Route
            path="/super-admin"
            element={
              <SuperAdminRoute>
                <SuperAdminLayout />
              </SuperAdminRoute>
            }
          >
            <Route index element={<SuperAdminOverview />} />
            <Route path="overview" element={<SuperAdminOverview />} />

            {/* User Management */}
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="admins" element={<AdminManagement />} />
            <Route path="permissions" element={<PermissionsManagement />} />

            {/* Platform Management */}
            <Route path="products" element={<SuperAdminProducts />} />
            <Route path="categories" element={<SuperAdminCategories />} />
            <Route path="orders" element={<SuperAdminOrders />} />
            <Route path="payments" element={<SuperAdminPayments />} />
            <Route path="reviews" element={<SuperAdminReviews />} />
            <Route path="reports" element={<SuperAdminReports />} />
            <Route path="inventory" element={<SuperAdminInventory />} />

            {/* System Management */}
            <Route
              path="activity-logs"
              element={<SuperAdminActivityLogs />}
            />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route path="profile" element={<SuperAdminProfile />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      <FeedbackToast />
    </div>
  );
}

export default App;

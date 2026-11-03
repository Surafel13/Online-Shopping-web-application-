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
import { FeedbackToast } from "./components/shared/FeedbackToast";
import { Home } from "./pages/Home";
import { Collections } from "./pages/Collections";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
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

import { SuperAdminRoute } from "./components/auth/SuperAdminRoute";
import { SuperAdminLayout } from "./components/layout/SuperAdminLayout";
import { SuperAdminOverview } from "./pages/superadmin/SuperAdminOverview";
import {
  SuperAdminUsers,
  SuperAdminAdmins,
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

function App() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/super-admin");
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth,
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
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:id" element={<ProductDetail />} />
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

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
            <Route path="users" element={<SuperAdminUsers />} />
            <Route path="admins" element={<SuperAdminAdmins />} />
            <Route path="products" element={<SuperAdminProducts />} />
            <Route path="categories" element={<SuperAdminCategories />} />
            <Route path="orders" element={<SuperAdminOrders />} />
            <Route path="payments" element={<SuperAdminPayments />} />
            <Route path="reviews" element={<SuperAdminReviews />} />
            <Route path="reports" element={<SuperAdminReports />} />
            <Route path="inventory" element={<SuperAdminInventory />} />
            <Route path="activity-logs" element={<SuperAdminActivityLogs />} />
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

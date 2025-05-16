
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Menu from "@/pages/Menu";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import Categories from "@/pages/Categories";
import ComplementGroups from "@/pages/ComplementGroups";
import ProductEdit from "@/pages/ProductEdit";
import ProductOrder from "@/pages/ProductOrder";

import "@/App.css";

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complement-groups"
              element={
                <ProtectedRoute>
                  <ComplementGroups />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <ProtectedRoute>
                  <ProductEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product-order"
              element={
                <ProtectedRoute>
                  <ProductOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <Subscription />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Toaster position="top-right" />
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

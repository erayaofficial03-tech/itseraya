import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import RoleGuard from "./components/auth/RoleGuard";
import { PageLoader } from "./components/ui/skeletons";
import { ROUTES } from "./lib/routes";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Category = lazy(() => import("./pages/Category"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Catalogue = lazy(() => import("./pages/Catalogue"));
const About = lazy(() => import("./pages/About"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductsAdmin = lazy(() => import("./pages/admin/ProductsAdmin"));
const CategoriesAdmin = lazy(() => import("./pages/admin/CategoriesAdmin"));
const BannerAdmin = lazy(() => import("./pages/admin/BannerAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));
const AdminsAdmin = lazy(() => import("./pages/admin/AdminsAdmin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min default
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const Public = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard require="public">{children}</RoleGuard>
);
const Admin = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard require="admin">{children}</RoleGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public storefront */}
            <Route path={ROUTES.home} element={<Public><Index /></Public>} />
            <Route path={ROUTES.category} element={<Public><Category /></Public>} />
            <Route path={ROUTES.product} element={<Public><ProductDetail /></Public>} />
            <Route path={ROUTES.catalogue} element={<Public><Catalogue /></Public>} />
            <Route path={ROUTES.about} element={<Public><About /></Public>} />
            <Route path={ROUTES.checkout} element={<Public><Checkout /></Public>} />

            {/* OAuth callback */}
            <Route path={ROUTES.authCallback} element={<AuthCallback />} />

            {/* Admin */}
            <Route path={ROUTES.adminLogin} element={<AdminLogin />} />
            <Route
              path={ROUTES.admin}
              element={<Admin><AdminLayout /></Admin>}
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="banner" element={<BannerAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="admins" element={<AdminsAdmin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import WhatsAppFallbackDialog from "@/components/WhatsAppFallbackDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import RoleGuard from "./components/auth/RoleGuard";
import InstallPrompt from "./components/pwa/InstallPrompt";
import BottomNav from "./components/header/BottomNav";
import BrandProvider from "./components/providers/BrandProvider";
import SeoHead from "./components/providers/SeoHead";
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
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductsAdmin = lazy(() => import("./pages/admin/ProductsAdmin"));
const CategoriesAdmin = lazy(() => import("./pages/admin/CategoriesAdmin"));
const BannerAdmin = lazy(() => import("./pages/admin/BannerAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));
const AdminsAdmin = lazy(() => import("./pages/admin/AdminsAdmin"));
const EnquiriesAdmin = lazy(() => import("./pages/admin/EnquiriesAdmin"));
const AnnouncementAdmin = lazy(() => import("./pages/admin/AnnouncementAdmin"));
const BrandAdmin = lazy(() => import("./pages/admin/BrandAdmin"));
const LabelsAdmin = lazy(() => import("./pages/admin/LabelsAdmin"));
const SeoAdmin = lazy(() => import("./pages/admin/SeoAdmin"));
const CustomersAdmin = lazy(() => import("./pages/admin/CustomersAdmin"));

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
const AdminOnly = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard require="adminOnly">{children}</RoleGuard>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrandProvider>
        <SeoHead />
        <Toaster />
        <Sonner />
        <WhatsAppFallbackDialog />
        <BrowserRouter>
          <ScrollToTop />
          <InstallPrompt />
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
                <Route path="announcement" element={<AnnouncementAdmin />} />
                <Route path="brand" element={<AdminOnly><BrandAdmin /></AdminOnly>} />
                <Route path="labels" element={<AdminOnly><LabelsAdmin /></AdminOnly>} />
                <Route path="seo" element={<AdminOnly><SeoAdmin /></AdminOnly>} />
                <Route path="settings" element={<AdminOnly><SettingsAdmin /></AdminOnly>} />
                <Route path="admins" element={<AdminOnly><AdminsAdmin /></AdminOnly>} />
                <Route path="users" element={<AdminOnly><AdminsAdmin /></AdminOnly>} />
                <Route path="enquiries" element={<EnquiriesAdmin />} />
                <Route path="customers" element={<CustomersAdmin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </BrandProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

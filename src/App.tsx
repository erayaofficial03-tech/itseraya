import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import WhatsAppFallbackDialog from "@/components/WhatsAppFallbackDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import RoleGuard from "./components/auth/RoleGuard";

import BottomNav from "./components/header/BottomNav";
import WhatsAppFloat from "./components/WhatsAppFloat";
import ModeSwitcher from "./components/ModeSwitcher";

import BrandProvider from "./components/providers/BrandProvider";
import { EnquiryCartProvider } from "./components/EnquiryCartProvider";
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
const TrackEnquiry = lazy(() => import("./pages/TrackEnquiry"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const CancellationPolicy = lazy(() => import("./pages/CancellationPolicy"));
const SearchPage = lazy(() => import("./pages/Search"));
const Faq = lazy(() => import("./pages/Faq"));
const CareGuide = lazy(() => import("./pages/CareGuide"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductsAdmin = lazy(() => import("./pages/admin/ProductsAdmin"));
const CategoriesAdmin = lazy(() => import("./pages/admin/CategoriesAdmin"));
const BannerAdmin = lazy(() => import("./pages/admin/BannerAdmin"));
const BannersAdmin = lazy(() => import("./pages/admin/BannersAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));
const AdminsAdmin = lazy(() => import("./pages/admin/AdminsAdmin"));
const EnquiriesAdmin = lazy(() => import("./pages/admin/EnquiriesAdmin"));
const AnnouncementAdmin = lazy(() => import("./pages/admin/AnnouncementAdmin"));
const BrandAdmin = lazy(() => import("./pages/admin/BrandAdmin"));
const LabelsAdmin = lazy(() => import("./pages/admin/LabelsAdmin"));
const SeoAdmin = lazy(() => import("./pages/admin/SeoAdmin"));
const CustomersAdmin = lazy(() => import("./pages/admin/CustomersAdmin"));
const PoliciesAdmin = lazy(() => import("./pages/admin/PoliciesAdmin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
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
        <BrowserRouter>
        <EnquiryCartProvider>
        <SeoHead />
        <Toaster />
        <Sonner />
        <WhatsAppFallbackDialog />
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
              <Route path="/track" element={<Public><TrackEnquiry /></Public>} />
              <Route path="/return-policy" element={<Public><ReturnPolicy /></Public>} />
              <Route path="/shipping-policy" element={<Public><ShippingPolicy /></Public>} />
              <Route path="/cancellation-policy" element={<Public><CancellationPolicy /></Public>} />
              <Route path="/search" element={<Public><SearchPage /></Public>} />
              <Route path="/faq" element={<Public><Faq /></Public>} />
              <Route path="/care" element={<Public><CareGuide /></Public>} />
              <Route path="/contact" element={<Public><Contact /></Public>} />

              {/* Customer auth */}
              <Route path="/login" element={<Public><Login /></Public>} />
              <Route path="/profile" element={<Public><Profile /></Public>} />
              <Route path="/wishlist" element={<Public><Wishlist /></Public>} />
              <Route path="/reset-password" element={<ResetPassword />} />

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
                <Route path="banners" element={<BannersAdmin />} />
                <Route path="announcement" element={<AnnouncementAdmin />} />
                <Route path="brand" element={<AdminOnly><BrandAdmin /></AdminOnly>} />
                <Route path="labels" element={<AdminOnly><LabelsAdmin /></AdminOnly>} />
                <Route path="seo" element={<AdminOnly><SeoAdmin /></AdminOnly>} />
                <Route path="policies" element={<AdminOnly><PoliciesAdmin /></AdminOnly>} />
                <Route path="settings" element={<AdminOnly><SettingsAdmin /></AdminOnly>} />
                <Route path="admins" element={<AdminOnly><AdminsAdmin /></AdminOnly>} />
                <Route path="users" element={<AdminOnly><AdminsAdmin /></AdminOnly>} />
                <Route path="enquiries" element={<EnquiriesAdmin />} />
                <Route path="customers" element={<CustomersAdmin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            
          </Suspense>
          <WhatsAppFloat />
          <BottomNav />
        </EnquiryCartProvider>
        </BrowserRouter>
      </BrandProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

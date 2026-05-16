import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import WhatsAppFallbackDialog from "@/components/WhatsAppFallbackDialog";
import { ConfirmDialogRoot } from "@/components/ui/confirm-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import RoleGuard from "./components/auth/RoleGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import { lazyWithRetry } from "./lib/lazyWithRetry";

import BottomNav from "./components/header/BottomNav";
import WhatsAppFloat from "./components/WhatsAppFloat";
import StorefrontPage from "./components/layout/StorefrontPage";


import BrandProvider from "./components/providers/BrandProvider";
import { EnquiryCartProvider } from "./components/EnquiryCartProvider";
import SeoHead from "./components/providers/SeoHead";
import { PageLoader } from "./components/ui/skeletons";
import { ROUTES } from "./lib/routes";

// Lazy-loaded pages
const Index = lazyWithRetry(() => import("./pages/Index"), { reloadKey: "Index" });
const Category = lazyWithRetry(() => import("./pages/Category"), { reloadKey: "Category" });
const ProductDetail = lazyWithRetry(() => import("./pages/ProductDetail"), { reloadKey: "ProductDetail" });
const ProductRedirect = lazyWithRetry(() => import("./pages/ProductRedirect"), { reloadKey: "ProductRedirect" });
const CategoryRedirect = lazyWithRetry(() => import("./pages/CategoryRedirect"), { reloadKey: "CategoryRedirect" });
const Catalogue = lazyWithRetry(() => import("./pages/Catalogue"), { reloadKey: "Catalogue" });
const About = lazyWithRetry(() => import("./pages/About"), { reloadKey: "About" });
const NotFound = lazyWithRetry(() => import("./pages/NotFound"), { reloadKey: "NotFound" });
const AuthCallback = lazyWithRetry(() => import("./pages/AuthCallback"), { reloadKey: "AuthCallback" });
const Login = lazyWithRetry(() => import("./pages/Login"), { reloadKey: "Login" });
const Profile = lazyWithRetry(() => import("./pages/Profile"), { reloadKey: "Profile" });
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"), { reloadKey: "ResetPassword" });
const Wishlist = lazyWithRetry(() => import("./pages/Wishlist"), { reloadKey: "Wishlist" });
const TrackEnquiry = lazyWithRetry(() => import("./pages/TrackEnquiry"), { reloadKey: "TrackEnquiry" });
const ReturnPolicy = lazyWithRetry(() => import("./pages/ReturnPolicy"), { reloadKey: "ReturnPolicy" });
const ShippingPolicy = lazyWithRetry(() => import("./pages/ShippingPolicy"), { reloadKey: "ShippingPolicy" });
const CancellationPolicy = lazyWithRetry(() => import("./pages/CancellationPolicy"), { reloadKey: "CancellationPolicy" });
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"), { reloadKey: "PrivacyPolicy" });
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService"), { reloadKey: "TermsOfService" });
const Faq = lazyWithRetry(() => import("./pages/Faq"), { reloadKey: "Faq" });
const CareGuide = lazyWithRetry(() => import("./pages/CareGuide"), { reloadKey: "CareGuide" });
const Contact = lazyWithRetry(() => import("./pages/Contact"), { reloadKey: "Contact" });
const DomainHealth = lazyWithRetry(() => import("./pages/DomainHealth"), { reloadKey: "DomainHealth" });
const AdminProfile = lazyWithRetry(() => import("./pages/admin/AdminProfile"), { reloadKey: "AdminProfile" });
const CompleteProfile = lazyWithRetry(() => import("./pages/CompleteProfile"), { reloadKey: "CompleteProfile" });
const AdminLayout = lazyWithRetry(() => import("./pages/admin/AdminLayout"), { reloadKey: "AdminLayout" });
const Dashboard = lazyWithRetry(() => import("./pages/admin/Dashboard"), { reloadKey: "Dashboard" });
const ProductsAdmin = lazyWithRetry(() => import("./pages/admin/ProductsAdmin"), { reloadKey: "ProductsAdmin" });
const CategoriesAdmin = lazyWithRetry(() => import("./pages/admin/CategoriesAdmin"), { reloadKey: "CategoriesAdmin" });
const BannerAdmin = lazyWithRetry(() => import("./pages/admin/BannerAdmin"), { reloadKey: "BannerAdmin" });
const BannersAdmin = lazyWithRetry(() => import("./pages/admin/BannersAdmin"), { reloadKey: "BannersAdmin" });
const SettingsAdmin = lazyWithRetry(() => import("./pages/admin/SettingsAdmin"), { reloadKey: "SettingsAdmin" });
const AdminsAdmin = lazyWithRetry(() => import("./pages/admin/AdminsAdmin"), { reloadKey: "AdminsAdmin" });
const EnquiriesAdmin = lazyWithRetry(() => import("./pages/admin/EnquiriesAdmin"), { reloadKey: "EnquiriesAdmin" });
const AnnouncementAdmin = lazyWithRetry(() => import("./pages/admin/AnnouncementAdmin"), { reloadKey: "AnnouncementAdmin" });
const BrandAdmin = lazyWithRetry(() => import("./pages/admin/BrandAdmin"), { reloadKey: "BrandAdmin" });
const LabelsAdmin = lazyWithRetry(() => import("./pages/admin/LabelsAdmin"), { reloadKey: "LabelsAdmin" });
const ProductTagsAdmin = lazyWithRetry(() => import("./pages/admin/ProductTagsAdmin"), { reloadKey: "ProductTagsAdmin" });
const SeoAdmin = lazyWithRetry(() => import("./pages/admin/SeoAdmin"), { reloadKey: "SeoAdmin" });
const CustomersAdmin = lazyWithRetry(() => import("./pages/admin/CustomersAdmin"), { reloadKey: "CustomersAdmin" });
const PoliciesAdmin = lazyWithRetry(() => import("./pages/admin/PoliciesAdmin"), { reloadKey: "PoliciesAdmin" });
const UspsAdmin = lazyWithRetry(() => import("./pages/admin/UspsAdmin"), { reloadKey: "UspsAdmin" });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
    },
  },
});

// iOS PWA: invalidate stale queries when app returns to foreground
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      queryClient.invalidateQueries({
        predicate: (query) => Date.now() - query.state.dataUpdatedAt > 5 * 60 * 1000,
      });
    }
  });
}

const Public = ({ children }: { children: React.ReactNode }) => (
  <RoleGuard require="public">
    <StorefrontPage>{children}</StorefrontPage>
  </RoleGuard>
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
        <ConfirmDialogRoot />
          <ScrollToTop />
          
          <Suspense fallback={<PageLoader />}>
            
            <Routes>
              {/* Public storefront */}
              <Route path={ROUTES.home} element={<Public><Index /></Public>} />
              <Route path={ROUTES.category} element={<Public><Category /></Public>} />
              <Route path={ROUTES.product} element={<Public><ProductDetail /></Public>} />
              {/* Legacy URL redirects (preserve old links/bookmarks) */}
              <Route path="/product/:productId" element={<ProductRedirect />} />
              <Route path="/category/:category" element={<CategoryRedirect />} />
              <Route path={ROUTES.catalogue} element={<Public><Catalogue /></Public>} />
              <Route path={ROUTES.about} element={<Public><About /></Public>} />
              <Route path="/track" element={<Public><TrackEnquiry /></Public>} />
              <Route path="/return-policy" element={<Public><ReturnPolicy /></Public>} />
              <Route path="/shipping-policy" element={<Public><ShippingPolicy /></Public>} />
              <Route path="/cancellation-policy" element={<Public><CancellationPolicy /></Public>} />
              <Route path="/privacy-policy" element={<Public><PrivacyPolicy /></Public>} />
              <Route path="/terms-of-service" element={<Public><TermsOfService /></Public>} />
              <Route path="/faq" element={<Public><Faq /></Public>} />
              <Route path="/care" element={<Public><CareGuide /></Public>} />
              <Route path="/contact" element={<Public><Contact /></Public>} />
              <Route path="/domain-health" element={<DomainHealth />} />

              {/* Customer auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Public><Profile /></Public>} />
              <Route path="/wishlist" element={<Public><Wishlist /></Public>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />

              {/* OAuth callback */}
              <Route path={ROUTES.authCallback} element={<AuthCallback />} />

              {/* Admin */}
              <Route
                path={ROUTES.admin}
                element={<Admin><AdminLayout /></Admin>}
              >
                <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="banner" element={<BannerAdmin />} />
                <Route path="banners" element={<BannersAdmin />} />
                <Route path="usps" element={<AdminOnly><UspsAdmin /></AdminOnly>} />
                <Route path="announcement" element={<AnnouncementAdmin />} />
                <Route path="brand" element={<AdminOnly><BrandAdmin /></AdminOnly>} />
                <Route path="labels" element={<AdminOnly><LabelsAdmin /></AdminOnly>} />
                <Route path="tags" element={<AdminOnly><ProductTagsAdmin /></AdminOnly>} />
                <Route path="seo" element={<AdminOnly><SeoAdmin /></AdminOnly>} />
                <Route path="policies" element={<AdminOnly><PoliciesAdmin /></AdminOnly>} />
                <Route path="settings" element={<AdminOnly><SettingsAdmin /></AdminOnly>} />
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Catalogue from "./pages/Catalogue";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import RequireAuth from "./components/auth/RequireAuth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import BannerAdmin from "./pages/admin/BannerAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import AdminsAdmin from "./pages/admin/AdminsAdmin";
import { ROUTES } from "./lib/routes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path={ROUTES.home} element={<Index />} />
          <Route path={ROUTES.category} element={<Category />} />
          <Route path={ROUTES.product} element={<ProductDetail />} />
          <Route path={ROUTES.catalogue} element={<Catalogue />} />
          <Route path={ROUTES.login} element={<Login />} />
          <Route path={ROUTES.signup} element={<Signup />} />
          <Route path={ROUTES.forgotPassword} element={<ForgotPassword />} />
          <Route path={ROUTES.resetPassword} element={<ResetPassword />} />
          <Route path={ROUTES.account} element={<RequireAuth><Account /></RequireAuth>} />
          <Route path={ROUTES.about} element={<About />} />
          <Route path={ROUTES.adminLogin} element={<AdminLogin />} />
          <Route path={ROUTES.admin} element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="banner" element={<BannerAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="admins" element={<AdminsAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

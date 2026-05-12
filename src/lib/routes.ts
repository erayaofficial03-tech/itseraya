/**
 * Single source of truth for app route paths.
 *
 * Used by:
 *  - `src/App.tsx` for <Route path={...}>
 *  - `src/lib/safeRedirect.ts` for the open-redirect allow-list
 *
 * When you add a new public-facing route, add it here so the redirect
 * allow-list picks it up automatically.
 */

export const ROUTES = {
  home: "/",
  category: "/category/:category",
  product: "/product/:productId",
  catalogue: "/catalogue",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  account: "/account",
  about: "/about",
  checkout: "/checkout",
  adminLogin: "/admin/login",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminCategories: "/admin/categories",
  adminBanner: "/admin/banner",
  adminSettings: "/admin/settings",
  adminAdmins: "/admin/admins",
} as const;

/**
 * Routes safe to redirect to after sign-in.
 * Excludes auth pages (`/login`, `/signup`, etc.) to avoid loops.
 *
 * Derived from ROUTES — params (`:foo`) are reduced to their static prefix
 * (e.g. `/category/:category` → `/category/`), and prefixes ending in `/`
 * match any sub-path.
 */
const REDIRECT_SAFE_KEYS: Array<keyof typeof ROUTES> = [
  "home",
  "category",
  "product",
  "catalogue",
  "account",
  "about",
  "checkout",
  "admin",
  "adminProducts",
  "adminCategories",
  "adminBanner",
  "adminSettings",
  "adminAdmins",
];

export const ALLOWED_REDIRECT_PREFIXES: string[] = REDIRECT_SAFE_KEYS.map((k) => {
  const path = ROUTES[k];
  const paramIdx = path.indexOf("/:");
  return paramIdx === -1 ? path : path.slice(0, paramIdx + 1); // keep trailing "/"
});

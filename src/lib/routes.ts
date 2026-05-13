/**
 * Single source of truth for app route paths.
 */

export const ROUTES = {
  home: "/",
  category: "/category/:category",
  product: "/product/:productId",
  catalogue: "/catalogue",
  about: "/about",
  checkout: "/checkout",
  login: "/login",
  profile: "/profile",
  wishlist: "/wishlist",
  resetPassword: "/reset-password",
  authCallback: "/auth/callback",
  adminLogin: "/admin/login",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminCategories: "/admin/categories",
  adminBanner: "/admin/banner",
  adminSettings: "/admin/settings",
  adminAdmins: "/admin/admins",
} as const;

/** Routes safe to redirect to after sign-in. */
const REDIRECT_SAFE_KEYS: Array<keyof typeof ROUTES> = [
  "home",
  "category",
  "product",
  "catalogue",
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
  return paramIdx === -1 ? path : path.slice(0, paramIdx + 1);
});

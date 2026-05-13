import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Defensive guard: only renders children when the current user truly
 * holds the matching role. Returns null while auth is loading so a
 * banner never flashes for a non-staff user.
 */
const RoleBanner = ({
  role,
  children,
}: {
  role: "admin" | "manager";
  children: ReactNode;
}) => {
  const { isAdmin, isManager, loading } = useAuth();
  if (loading) return null;
  if (role === "admin" && !isAdmin) return null;
  if (role === "manager" && !(isManager && !isAdmin)) return null;
  return <>{children}</>;
};

export default RoleBanner;

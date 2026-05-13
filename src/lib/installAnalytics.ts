import { supabase } from "@/integrations/supabase/client";

export type InstallEventType =
  | "prompt_shown"
  | "ios_guide_opened"
  | "copy_link"
  | "accepted"
  | "dismissed"
  | "installed"
  | "unavailable";

export type InstallPlatform = "ios" | "android" | "desktop" | "other";

export const detectPlatform = (): InstallPlatform => {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  if (/windows|macintosh|linux/i.test(ua)) return "desktop";
  return "other";
};

export const logInstallEvent = (
  event_type: InstallEventType,
  platform?: InstallPlatform,
) => {
  const page_path =
    typeof window !== "undefined" ? window.location.pathname : null;
  void supabase.from("install_events").insert({
    event_type,
    platform: platform ?? detectPlatform(),
    page_path,
  });
};

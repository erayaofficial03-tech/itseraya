import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    // Changes on every build so the SW detects a new version automatically.
    __APP_BUILD__: JSON.stringify(Date.now().toString()),
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: { enabled: false },
      includeAssets: [
        "eraya-logo.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "maskable-192.png",
        "maskable-512.png",
      ],
      manifest: {
        name: "Eraya",
        short_name: "Eraya",
        description: "Adorn Your Story | Artificial Jewellery",
        theme_color: "#C9A84C",
        background_color: "#FAF7F2",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/auth\/callback/, /^\/admin/, /^\/auth/],
        runtimeCaching: [
          {
            urlPattern: /supabase\.co\/(rest|auth|functions)/,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /\.(js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "eraya-bundles",
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(png|jpg|jpeg|webp|svg|gif|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "eraya-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(woff|woff2|ttf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "eraya-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /supabase\.co\/storage/,
            handler: "CacheFirst",
            options: {
              cacheName: "eraya-product-images",
              expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          motion: ["framer-motion"],
          charts: ["recharts"],
          pdf: ["jspdf", "html2canvas"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
}));

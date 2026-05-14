// Public sitemap.xml generator. Lists all visible products/categories + static pages.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("slug, created_at")
      .eq("is_visible", true)
      .not("slug", "is", null),
    supabase
      .from("categories")
      .select("slug")
      .eq("is_visible", true)
      .not("slug", "is", null),
  ]);

  const base = "https://itseraya.in";
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: "/", priority: "1.0", changefreq: "daily" },
    { url: "/catalogue", priority: "0.9", changefreq: "daily" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.6", changefreq: "monthly" },
    { url: "/faq", priority: "0.4", changefreq: "monthly" },
    { url: "/care", priority: "0.4", changefreq: "monthly" },
    { url: "/return-policy", priority: "0.3", changefreq: "monthly" },
    { url: "/shipping-policy", priority: "0.3", changefreq: "monthly" },
    { url: "/cancellation-policy", priority: "0.3", changefreq: "monthly" },
    { url: "/privacy-policy", priority: "0.3", changefreq: "monthly" },
    { url: "/terms-of-service", priority: "0.3", changefreq: "monthly" },
  ];

  const entries: string[] = [];
  for (const p of staticPages) {
    entries.push(
      `  <url>\n    <loc>${base}${p.url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
    );
  }
  for (const c of categories || []) {
    entries.push(
      `  <url>\n    <loc>${base}/collection/${c.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    );
  }
  for (const p of products || []) {
    const lastmod = (p.created_at as string | null)?.split("T")[0] || today;
    entries.push(
      `  <url>\n    <loc>${base}/jewellery/${p.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

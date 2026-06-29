/**
 * Generates public/sitemap.xml from the live database.
 * Runs via predev / prebuild npm scripts so the published site always
 * ships an up-to-date sitemap that Google can fetch at /sitemap.xml.
 */
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "sitemap generation skipped: missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or a publishable/anon key (SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PUBLISHABLE_KEY, or SUPABASE_ANON_KEY).",
  );
  process.exit(1);
}

const BASE_URL = "https://itseraya.in";

interface Entry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const today = new Date().toISOString().split("T")[0];

const staticPages: Entry[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/catalogue", changefreq: "daily", priority: "0.9" },
  { loc: "/about", changefreq: "monthly", priority: "0.7" },
  { loc: "/contact", changefreq: "monthly", priority: "0.6" },
  { loc: "/track", changefreq: "monthly", priority: "0.5" },
  { loc: "/wishlist", changefreq: "monthly", priority: "0.4" },
  { loc: "/checkout", changefreq: "monthly", priority: "0.4" },
  { loc: "/faq", changefreq: "monthly", priority: "0.4" },
  { loc: "/care", changefreq: "monthly", priority: "0.4" },
  { loc: "/blog/oxidised-jewellery-styling-guide", changefreq: "monthly", priority: "0.6" },
  { loc: "/return-policy", changefreq: "monthly", priority: "0.3" },
  { loc: "/shipping-policy", changefreq: "monthly", priority: "0.3" },
  { loc: "/cancellation-policy", changefreq: "monthly", priority: "0.3" },
  { loc: "/privacy-policy", changefreq: "monthly", priority: "0.3" },
  { loc: "/terms-of-service", changefreq: "monthly", priority: "0.3" },
];


async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

  const entries: Entry[] = [...staticPages];

  for (const c of categories || []) {
    entries.push({
      loc: `/collection/${c.slug}`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8",
    });
  }

  for (const p of products || []) {
    entries.push({
      loc: `/jewellery/${p.slug}`,
      lastmod: (p.created_at as string | null)?.split("T")[0] || today,
      changefreq: "weekly",
      priority: "0.9",
    });
  }

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.loc}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${entries.length} URLs)`);
}

main().catch((e) => {
  console.error("sitemap generation failed:", e);
  // Don't fail the build — fall back to whatever existed
  process.exit(0);
});

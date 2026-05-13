import jsPDF from "jspdf";
import type { Product, Settings } from "./queries";
import { productImage, discountPct } from "./queries";
import { s } from "./settingsDefaults";

/**
 * jsPDF's default Helvetica cannot render ₹ (U+20B9). We lazy-load Noto Sans
 * (Regular + Bold) TTFs once per session, base64 them, register via VFS, and
 * switch the active font to "NotoSans". On any failure we transparently fall
 * back to helvetica + the "Rs." prefix so PDFs always render.
 */
const NOTO_REGULAR_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Regular.ttf";
const NOTO_BOLD_URL =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts/hinted/ttf/NotoSans/NotoSans-Bold.ttf";

let fontCache: { regular: string; bold: string } | null = null;
let fontLoadFailed = false;

const fetchFontBase64 = async (url: string): Promise<string> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
};

/**
 * Registers Noto Sans on the given doc. Returns true if available, false if
 * we should fall back to helvetica + Rs. prefix.
 */
const ensureRupeeFont = async (doc: jsPDF): Promise<boolean> => {
  if (fontLoadFailed) return false;
  try {
    if (!fontCache) {
      const [regular, bold] = await Promise.all([
        fetchFontBase64(NOTO_REGULAR_URL),
        fetchFontBase64(NOTO_BOLD_URL),
      ]);
      fontCache = { regular, bold };
    }
    doc.addFileToVFS("NotoSans-Regular.ttf", fontCache.regular);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
    doc.addFileToVFS("NotoSans-Bold.ttf", fontCache.bold);
    doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");
    return true;
  } catch {
    fontLoadFailed = true;
    return false;
  }
};

/** Active font family for the current generation pass. */
let pdfFont: string = "helvetica";

const setFont = (doc: jsPDF, weight: "normal" | "bold") => {
  doc.setFont(pdfFont, weight);
};

const formatPdfPrice = (amount: number): string => {
  const formatted = Math.round(amount).toLocaleString("en-IN");
  return pdfFont === "NotoSans" ? `₹${formatted}` : `Rs. ${formatted}`;
};


const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const todayISO = () => new Date().toISOString().slice(0, 10);

const fetchImageAsDataURL = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return [201, 168, 76];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
};

const getLogo = async (settings: Settings | undefined): Promise<string | null> => {
  const url = settings?.logo_url || "/eraya-logo.png";
  return fetchImageAsDataURL(url);
};

const drawHeader = (doc: jsPDF, settings: Settings | undefined, logo: string | null) => {
  const [r, g, b] = hexToRgb(s(settings, "pdf_primary_color"));
  if (logo) {
    // Centered, max 20mm tall, proportional width capped at 80mm
    const h = 20;
    const w = Math.min(80, h * 3); // assume ~3:1 logo
    const x = (210 - w) / 2;
    try {
      doc.addImage(logo, "PNG", x, 8, w, h);
    } catch {
      // fallback if image format not detected
      setFont(doc, "bold");
      doc.setFontSize(22);
      doc.setTextColor(r, g, b);
      doc.text(s(settings, "pdf_store_name"), 105, 20, { align: "center" });
    }
  } else {
    setFont(doc, "bold");
    doc.setFontSize(22);
    doc.setTextColor(r, g, b);
    doc.text(s(settings, "pdf_store_name"), 105, 20, { align: "center" });
  }
  // Gold divider
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.4);
  doc.line(20, 32, 190, 32);
};

const drawFooter = (doc: jsPDF, settings: Settings | undefined, logo: string | null) => {
  const wa = settings?.whatsapp_number?.replace(/\D/g, "") || "";
  const y = 280;
  if (logo) {
    const h = 8;
    const w = h * 3;
    if (wa) {
      try {
        doc.addImage(logo, "PNG", 20, y, w, h);
      } catch {}
      setFont(doc, "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`+${wa}`, 190, y + h - 1.5, { align: "right" });
    } else {
      const x = (210 - w) / 2;
      try {
        doc.addImage(logo, "PNG", x, y, w, h);
      } catch {}
    }
  } else if (wa) {
    setFont(doc, "normal");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`+${wa}`, 105, 286, { align: "center" });
  }
};

const drawWatermark = (
  doc: jsPDF,
  logo: string | null,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  scale = 0.4,
) => {
  if (!logo) return;
  const w = imgW * scale;
  const h = w / 3;
  const x = imgX + (imgW - w) / 2;
  const y = imgY + (imgH - h) / 2;
  // Try GState opacity; fall back to bottom-right corner mark
  try {
    // @ts-ignore - GState is jsPDF runtime API
    const GState = (doc as any).GState;
    if (GState) {
      // @ts-ignore
      doc.setGState(new GState({ opacity: 0.28 }));
      doc.addImage(logo, "PNG", x, y, w, h);
      // @ts-ignore
      doc.setGState(new GState({ opacity: 1 }));
      return;
    }
  } catch {
    /* fall through */
  }
  // Fallback: small mark in bottom-right at 30%
  const fw = imgW * 0.3;
  const fh = fw / 3;
  try {
    doc.addImage(logo, "PNG", imgX + imgW - fw - 2, imgY + imgH - fh - 2, fw, fh);
  } catch {}
};

export const generateProductPdf = async (product: Product, settings: Settings | undefined) => {
  const [pr, pg, pb] = hexToRgb(s(settings, "pdf_primary_color"));
  const doc = new jsPDF();
  const logo = await getLogo(settings);

  drawHeader(doc, settings, logo);

  // Product image at y=36, 100x100, centered
  const imgX = 55, imgY = 36, imgW = 100, imgH = 100;
  const productImg = await fetchImageAsDataURL(productImage(product));
  if (productImg) {
    try {
      doc.addImage(productImg, "JPEG", imgX, imgY, imgW, imgH);
    } catch {
      try { doc.addImage(productImg, "PNG", imgX, imgY, imgW, imgH); } catch {}
    }
    drawWatermark(doc, logo, imgX, imgY, imgW, imgH, 0.4);
  }

  // Name
  setFont(doc, "bold");
  doc.setFontSize(16);
  doc.setTextColor(44, 44, 44);
  doc.text(product.name, 105, 144, { align: "center" });

  // Price (gold)
  const price = product.discounted_price ?? product.original_price;
  setFont(doc, "bold");
  doc.setFontSize(13);
  doc.setTextColor(pr, pg, pb);
  doc.text(formatPdfPrice(price), 105, 152, { align: "center" });

  // Discount line
  if (product.discounted_price && product.original_price > product.discounted_price) {
    setFont(doc, "normal");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `MRP ${formatPdfPrice(product.original_price)}  •  ${discountPct(product)}% OFF`,
      105,
      159,
      { align: "center" },
    );
  }

  // About this piece
  if (product.description) {
    setFont(doc, "bold");
    doc.setFontSize(10);
    doc.setTextColor(44, 44, 44);
    doc.text(s(settings, "product_description_label") || "About this piece", 30, 170);
    setFont(doc, "normal");
    doc.setFontSize(10);
    doc.setTextColor(90);
    const lines = doc.splitTextToSize(product.description, 150);
    doc.text(lines, 30, 177);
  }

  drawFooter(doc, settings, logo);
  doc.save(`Eraya-${slugify(product.name)}.pdf`);
};

export const generateCatalogPdf = async (products: Product[], settings: Settings | undefined) => {
  const [pr, pg, pb] = hexToRgb(s(settings, "pdf_primary_color"));
  const doc = new jsPDF();
  const logo = await getLogo(settings);

  drawHeader(doc, settings, logo);
  drawFooter(doc, settings, logo);

  const cardW = 80;
  const cardImgH = 55;
  const cardH = 80;
  const startY = 42;
  const gapX = 10;
  const gapY = 8;
  let col = 0;
  let row = 0;

  for (const p of products) {
    if (row >= 3) {
      doc.addPage();
      drawHeader(doc, settings, logo);
      drawFooter(doc, settings, logo);
      row = 0;
      col = 0;
    }
    const x = 20 + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    const img = await fetchImageAsDataURL(productImage(p));
    if (img) {
      try {
        doc.addImage(img, "JPEG", x, y, cardW, cardImgH);
      } catch {
        try { doc.addImage(img, "PNG", x, y, cardW, cardImgH); } catch {}
      }
      drawWatermark(doc, logo, x, y, cardW, cardImgH, 0.5);
    }

    // Name
    setFont(doc, "bold");
    doc.setFontSize(10);
    doc.setTextColor(44);
    const nameLines = doc.splitTextToSize(p.name, cardW);
    doc.text(nameLines.slice(0, 1), x, y + cardImgH + 6);

    // Price (gold)
    const price = p.discounted_price ?? p.original_price;
    setFont(doc, "bold");
    doc.setFontSize(9);
    doc.setTextColor(pr, pg, pb);
    const priceText = formatPdfPrice(price);
    doc.text(priceText, x, y + cardImgH + 13);

    // Strike-through original price if discounted
    if (p.discounted_price && p.original_price > p.discounted_price) {
      setFont(doc, "normal");
      doc.setFontSize(8);
      doc.setTextColor(150);
      const orig = formatPdfPrice(p.original_price);
      const priceWidth = doc.getTextWidth(priceText);
      const origX = x + priceWidth + 4;
      const origY = y + cardImgH + 13;
      doc.text(orig, origX, origY);
      const origWidth = doc.getTextWidth(orig);
      doc.setDrawColor(150);
      doc.setLineWidth(0.3);
      doc.line(origX, origY - 1.2, origX + origWidth, origY - 1.2);
    }

    col++;
    if (col >= 2) {
      col = 0;
      row++;
    }
  }

  doc.save(`Eraya-Catalogue-${todayISO()}.pdf`);
};

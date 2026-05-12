import jsPDF from "jspdf";
import type { Product, Settings } from "./queries";
import { formatINR, productImage, discountPct } from "./queries";
import { s } from "./settingsDefaults";

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

const drawHeader = (doc: jsPDF, settings: Settings | undefined) => {
  const [r, g, b] = hexToRgb(s(settings, "pdf_primary_color"));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(r, g, b);
  doc.text(s(settings, "pdf_store_name"), 105, 18, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100);
  doc.text(s(settings, "pdf_tagline"), 105, 24, { align: "center" });
  doc.setDrawColor(r, g, b);
  doc.line(20, 28, 190, 28);
};

const drawFooter = (doc: jsPDF, settings: Settings | undefined) => {
  const wa = settings?.whatsapp_number || "";
  doc.setFontSize(8);
  doc.setTextColor(120);
  const txt = s(settings, "pdf_footer_text").replace("{whatsapp}", wa);
  doc.text(txt, 105, 290, { align: "center" });
};

export const generateProductPdf = async (product: Product, settings: Settings | undefined) => {
  const doc = new jsPDF();
  drawHeader(doc, settings);

  const img = await fetchImageAsDataURL(productImage(product));
  if (img) {
    try {
      doc.addImage(img, "JPEG", 55, 35, 100, 100);
    } catch {}
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(44, 44, 44);
  doc.text(product.name, 105, 150, { align: "center" });

  const price = product.discounted_price ?? product.original_price;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(201, 168, 76);
  doc.text(formatINR(price), 105, 160, { align: "center" });

  if (product.discounted_price && product.original_price > product.discounted_price) {
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`MRP ${formatINR(product.original_price)}  •  ${discountPct(product)}% OFF`, 105, 167, { align: "center" });
  }

  if (product.description) {
    doc.setFontSize(11);
    doc.setTextColor(60);
    const lines = doc.splitTextToSize(product.description, 150);
    doc.text(lines, 30, 180);
  }

  drawFooter(doc, settings);
  doc.save(`${product.name.replace(/\s+/g, "-")}.pdf`);
};

export const generateCatalogPdf = async (products: Product[], settings: Settings | undefined) => {
  const doc = new jsPDF();
  drawHeader(doc, settings);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(44, 44, 44);
  doc.text("Product Catalogue", 105, 40, { align: "center" });
  drawFooter(doc, settings);

  // Cards: 2 columns x 3 rows per page = 6 per page
  const cardW = 80;
  const cardH = 75;
  const startY = 50;
  let col = 0;
  let row = 0;

  for (const p of products) {
    if (row >= 3) {
      doc.addPage();
      drawHeader(doc, settings);
      drawFooter(doc, settings);
      row = 0;
      col = 0;
    }
    const x = 20 + col * (cardW + 10);
    const y = startY + row * (cardH + 5);
    const img = await fetchImageAsDataURL(productImage(p));
    if (img) {
      try {
        doc.addImage(img, "JPEG", x, y, cardW, 50);
      } catch {}
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(44);
    doc.text(p.name, x, y + 58);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(201, 168, 76);
    const price = p.discounted_price ?? p.original_price;
    doc.text(formatINR(price), x, y + 65);
    if (p.discounted_price && p.original_price > p.discounted_price) {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`MRP ${formatINR(p.original_price)}`, x + 25, y + 65);
    }
    col++;
    if (col >= 2) {
      col = 0;
      row++;
    }
  }

  doc.save("Eraya-Catalogue.pdf");
};

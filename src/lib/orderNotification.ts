interface OrderItemLite {
  product_name: string;
  variant_size?: string | null;
  quantity: number;
  unit_price: number;
}

interface OrderLite {
  order_ref: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
}

export const notifyAdminOnOrder = (
  order: OrderLite,
  items: OrderItemLite[],
  settings: { whatsapp_number?: string | null } | null | undefined
) => {
  const wa = settings?.whatsapp_number?.replace(/\D/g, "");
  if (!wa) return;
  const list = items
    .map(
      (i) =>
        `• ${i.product_name}${i.variant_size ? ` (${i.variant_size})` : ""} ×${i.quantity} — ₹${(
          i.unit_price * i.quantity
        ).toLocaleString("en-IN")}`
    )
    .join("\n");
  const msg =
    `🛍️ *New Order — ${order.order_ref}*\n\n` +
    `👤 ${order.customer_name}\n` +
    `📞 +91${order.customer_phone}\n` +
    `💰 Total: ₹${Number(order.total_amount).toLocaleString("en-IN")}\n\n` +
    `*Items:*\n${list}\n\n` +
    `✅ Payment screenshot uploaded\n` +
    `Please verify in admin panel.`;
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
};

import { useState } from "react";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import SeoHead from "@/components/providers/SeoHead";
import JsonLd from "@/components/providers/JsonLd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettings } from "@/lib/queries";
import { s } from "@/lib/settingsDefaults";
import { openWhatsApp } from "@/lib/whatsapp";
import { toast } from "sonner";

const Contact = () => {
  const { data: settings } = useSettings();
  const sx = (settings as unknown as Record<string, string | undefined>) ?? {};
  const wa = settings?.whatsapp_number?.replace(/\D/g, "");
  const email = sx.contact_email || sx.support_email;
  const phone = sx.contact_phone || settings?.whatsapp_number;
  const address = sx.store_address;
  const storeName = s(settings, "store_name");

  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wa) {
      toast.error("WhatsApp not configured yet.");
      return;
    }
    const text = `Hi ${storeName}!\n\nName: ${name}\nContact: ${from}\n\n${msg}`;
    openWhatsApp(wa, text);
  };

  const tiles = [
    wa && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: `+${wa}`,
      onClick: () => openWhatsApp(wa, `Hi ${storeName}!`),
    },
    email && {
      icon: Mail,
      label: "Email",
      value: email,
      onClick: () => (window.location.href = `mailto:${email}`),
    },
    phone && {
      icon: Phone,
      label: "Call",
      value: phone,
      onClick: () => (window.location.href = `tel:${phone}`),
    },
    address && {
      icon: MapPin,
      label: "Visit",
      value: address,
      onClick: () => {},
    },
  ].filter(Boolean) as { icon: any; label: string; value: string; onClick: () => void }[];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={`Contact — ${storeName}`} description={`Get in touch with ${storeName} for orders, custom pieces and styling advice.`} />
      <JsonLd
        id="contact-localbusiness"
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: storeName,
          url: "https://itseraya.in/contact",
          ...(email ? { email } : {}),
          ...(phone ? { telephone: phone } : {}),
          ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
        }}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-5 md:px-6 py-10 pb-[76px]">
        <h1 className="font-serif text-3xl md:text-5xl text-foreground text-center">Contact Us</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 mb-8">
          We'd love to hear from you. Choose the channel that suits you best.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-10">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                onClick={t.onClick}
                className="text-left flex flex-col gap-1 p-4 rounded-xl border border-border hover:border-gold transition-colors bg-background"
              >
                <Icon className="h-5 w-5 text-gold" />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.label}</p>
                <p className="text-sm font-medium truncate">{t.value}</p>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <h2 className="font-serif text-xl">Send a message</h2>
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Email or phone" value={from} onChange={(e) => setFrom(e.target.value)} required />
          <Textarea placeholder="How can we help?" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} required />
          <Button type="submit" className="w-full bg-charcoal text-white hover:bg-charcoal/90">
            <MessageCircle className="h-4 w-4 mr-2" /> Send via WhatsApp
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

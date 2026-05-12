import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { useSettings } from "@/lib/queries";

const About = () => {
  const { data: settings } = useSettings();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">About {settings?.store_name || "Eraya"}</h1>
        <p className="text-center text-gold italic mb-10">{settings?.tagline || "Adorn Your Story"}</p>
        <div className="prose prose-neutral max-w-none text-foreground/80 space-y-5 text-base leading-relaxed">
          <p>
            Eraya is a celebration of every woman's individuality — handcrafted artificial jewellery
            designed to make everyday moments feel a little more special.
          </p>
          <p>
            From timeless rings and statement earrings to delicate pendants and bold bangles,
            each piece is curated with care, quality, and an eye for detail.
          </p>
          <p>
            We believe jewellery is more than an accessory — it's a story. Yours. Adorn it beautifully.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

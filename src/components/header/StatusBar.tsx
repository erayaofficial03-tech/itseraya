import { useEffect, useState } from "react";

const usps = [
  "Handcrafted with love",
  "Free shipping on orders over ₹999",
  "Easy WhatsApp enquiries",
  "New arrivals every week",
];

const StatusBar = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % usps.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full bg-charcoal text-ivory">
      <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-center overflow-hidden">
        <p
          key={i}
          className="text-[11px] sm:text-xs font-light tracking-[0.2em] uppercase animate-fade-in"
        >
          {usps[i]}
        </p>
      </div>
    </div>
  );
};

export default StatusBar;

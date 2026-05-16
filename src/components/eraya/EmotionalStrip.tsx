interface Props {
  text?: string;
}

/**
 * Editorial pull-quote between product rows.
 * Italic Cormorant, generous vertical air, no CTA.
 */
const EmotionalStrip = ({ text = "Jewellery that feels like you." }: Props) => (
  <section className="w-full bg-gradient-to-b from-background to-blush/30 py-14 md:py-24">
    <div className="max-w-3xl mx-auto px-6 text-center">
      <span className="eyebrow">Wear Your Glow ✨</span>
      <p className="mt-4 md:mt-6 font-display italic text-2xl md:text-4xl lg:text-5xl leading-[1.15] text-ink">
        {text}
      </p>
    </div>
  </section>
);

export default EmotionalStrip;

import type { HomepageSection, Product } from "@/lib/queries";
import HeroSlider from "./HeroSlider";
import CategoryRow from "./CategoryRow";
import ProductRow from "./ProductRow";
import TrustStrip from "./TrustStrip";
import EmotionalStrip from "./EmotionalStrip";
import ErayaGirls from "./ErayaGirls";
import ReviewsSection from "./ReviewsSection";

interface Props {
  section: HomepageSection;
  products: Product[];
  isFirstProductRow?: boolean;
}

/**
 * Renders a single homepage block from its DB row. Maps `section.type`
 * to the matching customer-facing component and feeds `props` + filtered
 * products as needed.
 */
const HomepageSectionRenderer = ({ section, products, isFirstProductRow = false }: Props) => {
  const { type, props = {} } = section;

  const filterProducts = (): Product[] => {
    const visible = products.filter((p) => p.is_visible);
    const limit = props.limit ?? 12;
    switch (props.source) {
      case "new":
        return [...visible]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);
      case "bestseller":
        return visible.filter((p) => p.tags?.includes("bestseller")).slice(0, limit);
      case "sale":
        return visible
          .filter((p) => p.discounted_price && p.original_price > (p.discounted_price as number))
          .slice(0, limit);
      case "featured":
        return visible.filter((p) => p.is_featured).slice(0, limit);
      default:
        return visible.slice(0, limit);
    }
  };

  switch (type) {
    case "hero_slider":
      return <HeroSlider />;
    case "trust_strip":
      return <TrustStrip />;
    case "category_row":
      return <CategoryRow />;
    case "emotional_strip":
      return <EmotionalStrip text={props.text || "Jewellery that feels like you."} />;
    case "eraya_girls":
      return <ErayaGirls />;
    case "reviews":
      return <ReviewsSection />;
    case "product_row":
      return (
        <ProductRow
          eyebrow={props.eyebrow}
          title={props.title || "Products"}
          products={filterProducts()}
          viewAllHref={props.view_all}
        />
      );
    default:
      return null;
  }
};

export default HomepageSectionRenderer;

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProductRedirect = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) {
      navigate("/catalogue", { replace: true });
      return;
    }
    supabase
      .from("products")
      .select("slug")
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.slug) {
          navigate(`/jewellery/${data.slug}`, { replace: true });
        } else {
          navigate("/catalogue", { replace: true });
        }
      });
  }, [productId, navigate]);

  return null;
};

export default ProductRedirect;

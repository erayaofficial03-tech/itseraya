import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const CategoryRedirect = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    navigate(category ? `/collection/${category}` : "/catalogue", { replace: true });
  }, [category, navigate]);
  return null;
};

export default CategoryRedirect;

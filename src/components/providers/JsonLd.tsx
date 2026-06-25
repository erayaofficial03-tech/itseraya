import { useEffect } from "react";

interface Props {
  id: string;
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Inject a JSON-LD structured-data script into <head>. Removes itself on unmount.
 */
const JsonLd = ({ id, data }: Props) => {
  useEffect(() => {
    const scriptId = `ld-${id}`;
    let el = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = scriptId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      const node = document.getElementById(scriptId);
      if (node) node.remove();
    };
  }, [id, data]);
  return null;
};

export default JsonLd;

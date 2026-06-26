import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Subtle fade + lift used when mounting top-level pages. Kept very short
 * (180ms) so it never feels in the way on navigation.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.18, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;

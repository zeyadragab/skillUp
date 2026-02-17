import { memo } from "react";
import { motion } from "framer-motion";

/**
 * Animated card with hover and focus effects
 */
const AnimatedCard = memo(
  ({ children, className = "", delay = 0, focusEffect = true }) => {
    return (
      <motion.div
        className={`${className} outline-none ${
          focusEffect ? "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-4" : ""
        }`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{
          y: -12,
          transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
        whileTap={{ scale: 0.96 }}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export default AnimatedCard;

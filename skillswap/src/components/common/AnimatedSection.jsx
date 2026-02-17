import { memo } from "react";
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

/**
 * Animated section wrapper that triggers animation on scroll
 */
const AnimatedSection = memo(
  ({
    children,
    className = "",
    animation = "fadeInUp",
    delay = 0,
    duration = 0.6,
  }) => {
    const [ref, isVisible] = useScrollAnimation({ threshold: 0.1 });

    const animations = {
      fadeInUp: {
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        },
      },
      fadeInDown: {
        hidden: { opacity: 0, y: -50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        },
      },
      fadeInLeft: {
        hidden: { opacity: 0, x: -50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        },
      },
      fadeInRight: {
        hidden: { opacity: 0, x: 50 },
        visible: {
          opacity: 1,
          x: 0,
          transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        },
      },
      scaleIn: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
        },
      },
      slideInUp: {
        hidden: { opacity: 0, y: 100 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration, delay, type: "spring", stiffness: 100 },
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={animations[animation]}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedSection.displayName = "AnimatedSection";

export default AnimatedSection;

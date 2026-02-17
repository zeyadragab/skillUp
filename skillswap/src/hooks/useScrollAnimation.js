import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for scroll-triggered animations
 * Returns ref to attach to element and animated state
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    triggerOnce = true,
    rootMargin = "0px",
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, triggerOnce, rootMargin]);

  return [elementRef, isVisible];
};

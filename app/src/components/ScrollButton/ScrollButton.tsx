"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ArrowUp } from "@phosphor-icons/react";

const ScrollButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setIsVisible(y > 150));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          // Sits above the docked mobile nav, drops back down once it is gone.
          className="fixed bottom-24 right-6 lg:bottom-6 p-3 rounded-full bg-green-primary/25 text-green-primary hover:bg-green-primary/40 transition-colors shadow-lg z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top">
          <ArrowUp className="h-6 w-6" weight="bold" aria-hidden />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollButton;

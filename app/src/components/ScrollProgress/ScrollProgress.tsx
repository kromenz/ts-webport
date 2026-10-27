"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { textBar } from "@/src/lib/textBar";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    mass: 0.4,
  });

  // Written imperatively so the pill never re-renders React on scroll frames.
  // SSR and the first client render both show the 0% state (hidden).
  const pillRef = useRef<HTMLDivElement>(null);

  const paint = (p: number) => {
    const el = pillRef.current;
    if (!el) return;
    el.textContent = textBar(p);
    el.style.opacity = p > 0 ? "1" : "0";
  };

  useMotionValueEvent(scrollYProgress, "change", paint);

  // Sync once on mount, in case the page loads already scrolled (deep link).
  useEffect(() => {
    paint(scrollYProgress.get());
  }, [scrollYProgress]);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-green-primary shadow-[0_0_8px_rgba(52,211,153,0.6)] md:hidden"
      />
      <div
        ref={pillRef}
        aria-hidden
        style={{ opacity: 0 }}
        className="pointer-events-none fixed bottom-6 left-6 z-[60] hidden font-mono text-xs text-foreground/60 transition-opacity duration-300 md:block">
        {textBar(0)}
      </div>
    </>
  );
};

export default ScrollProgress;

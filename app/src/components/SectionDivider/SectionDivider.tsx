"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

import { useSiteReducedMotion } from "@/src/lib/motion";

type Props = {
  command: string;
  className?: string;
};

const SectionDivider = ({ command, className }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const [typed, setTyped] = useState("");
  const reduceMotion = useSiteReducedMotion();

  // Under reduced motion the command lands in one step rather than being
  // rendered differently, which would diverge from the server render.
  useEffect(() => {
    if (!isInView) return;
    if (typed.length >= command.length) return;
    const t = setTimeout(
      () =>
        setTyped(reduceMotion ? command : command.slice(0, typed.length + 1)),
      reduceMotion ? 0 : 50,
    );
    return () => clearTimeout(t);
  }, [isInView, typed, command, reduceMotion]);

  return (
    <div
      ref={ref}
      className={`container mx-auto px-4 mb-10 md:mb-14 ${className ?? ""}`}>
      <div className="flex flex-col items-center gap-4">
        <h2 className="font-mono text-2xl md:text-3xl font-bold text-foreground/85">
          <span className="text-foreground/40">$</span>{" "}
          <span>{typed}</span>
          <span
            aria-hidden
            className="ml-1 inline-block h-[0.9em] w-[0.5ch] -translate-y-px align-middle bg-green-primary animate-terminal-blink"
          />
        </h2>
        <motion.div
          aria-hidden
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: "easeOut",
            delay: reduceMotion ? 0 : 0.25,
          }}
          style={{ transformOrigin: "center" }}
          className="h-px w-full max-w-2xl bg-linear-to-r from-transparent via-green-primary/50 to-transparent"
        />
      </div>
    </div>
  );
};

export default SectionDivider;

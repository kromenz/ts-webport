"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StarfieldBackground } from "../../../../components/ui/starfield";
import { useSiteReducedMotion } from "@/src/lib/motion";

const ROLES = [
  "Full Stack Developer",
  "Problem Solver",
  "Builder of Things",
  "Engineer",
];

const Hero = () => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">(
    "typing",
  );
  const reduceMotion = useSiteReducedMotion();

  useEffect(() => {
    const current = ROLES[roleIndex];

    // Reduced motion: print the role once and settle, no cycling. The state
    // is filled rather than the render being branched, so the server and the
    // first client render always agree on the text.
    if (reduceMotion) {
      if (typed === current) return;
      const t = setTimeout(() => setTyped(current), 0);
      return () => clearTimeout(t);
    }

    if (phase === "typing") {
      if (typed.length < current.length) {
        const t = setTimeout(
          () => setTyped(current.slice(0, typed.length + 1)),
          60,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("holding"), 1600);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("deleting"), 1200);
      return () => clearTimeout(t);
    }

    // deleting
    if (typed.length > 0) {
      const t = setTimeout(() => setTyped(typed.slice(0, -1)), 35);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase("typing");
      setRoleIndex((i) => (i + 1) % ROLES.length);
    }, 250);
    return () => clearTimeout(t);
  }, [typed, phase, roleIndex, reduceMotion]);

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100dvh] flex items-center justify-center overflow-hidden pt-16 pb-20">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <StarfieldBackground className="absolute! inset-0!" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-30 bg-linear-to-b from-transparent via-background/70 to-background" />
      </div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-3 font-mono text-sm md:text-base text-foreground/60 tracking-wide">
          <span className="text-foreground/40">$</span>{" "}
          <span className="text-green-primary">whoami</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4 drop-shadow-sm">
          Rafael André
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
          className="text-xl md:text-2xl text-gray-400 mb-8 font-mono"
          aria-label={ROLES[roleIndex]}>
          <span>{typed}</span>
          <span
            aria-hidden
            className="ml-1 inline-block h-[1em] w-[0.55ch] -translate-y-[2px] align-middle bg-green-primary animate-terminal-blink"
          />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          className="flex justify-center gap-4">
          <button
            onClick={() =>
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="rounded-lg bg-white px-6 py-3 font-medium text-zinc-950 shadow-sm ring-2 ring-transparent transition-[color,box-shadow,background-color] hover:bg-transparent hover:text-white hover:ring-white">
            View Projects
          </button>
          <a
            href="/docs/Rafael_Andre.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Rafael André's CV in a new tab"
            className="rounded-lg border-2 border-white/90 bg-white/5 px-6 py-3 font-medium text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-zinc-950">
            My CV
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
